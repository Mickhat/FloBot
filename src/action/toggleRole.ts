import { ButtonInteraction, Client, Role } from "discord.js";
import { Logger } from "src/logger/logger";



export async function toggleRoles(client:Client, interaction: ButtonInteraction, logger:Logger) {

    let [method, rId] = interaction.customId.split('-');

    let role:Role|null|undefined = await interaction.guild?.roles.fetch(rId);

    if (!role) {
        interaction.reply({
            content: 'Ein Fehler ist beim zuweisen geschehen. Bitte versuche es später erneut.',
            ephemeral: true,
        })
        return;
    }

    if (!(process.env.TOGGLE_ROLES ?? "").includes(rId)) {
        interaction.reply({
            content: 'Die Rolle ist nicht frei verfügbar.',
            ephemeral: true
        })
    }

    let member = interaction.member;

    if (!member) {
        interaction.reply({
            content: 'Ein Fehler ist passiert.',
            ephemeral: true,
        })
        return;
    }

    let guildMember = await interaction.guild?.members.fetch(member.user.id)

    if (!guildMember) {
        interaction.reply({
            content: 'Ein Fehler ist passiert.',
            ephemeral: true
        })
        return;
    }

    if (method == 'addRole') {
        guildMember.roles.add(role).then(() => {
            interaction.reply({ content: "Rolle wurde hinzugefügt!", ephemeral: true })
            logger.logSync("INFO", `${guildMember?.user.username}#${guildMember?.user.discriminator} got role ${role?.name}`)
        })
    }
    if (method == 'removeRole') {
        guildMember.roles.remove(role).then(() => {
            interaction.reply({
                content: "Rolle wurde entfernt!",
                ephemeral: true
            })
            logger.logSync("INFO", `${guildMember?.user.username}#${guildMember?.user.discriminator} got role ${role?.name}`)
        })
    }
}