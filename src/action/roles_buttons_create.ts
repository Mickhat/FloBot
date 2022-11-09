import discord, { ActionRow, ButtonBuilder } from 'discord.js';
import { Logger } from '../logger/logger';

let toggleRoles: Array<string> = process.env.TOGGLE_ROLES?.split(',') || [];

/**
 * Creates a role choose panel with buttons
 * @param {discord.Interaction} interaction
 * @param { "global" | "once"} mode
 */
export default async function createRoleChoose(interaction: discord.Interaction, mode: "global" | "once", logger: Logger) {

    let buttons: Array<discord.ActionRowBuilder<ButtonBuilder>> = [];
    let commandMode = mode;

    for (let i in toggleRoles) {
        let rId = i

        if (interaction == null) {
            logger.logSync("ERROR", "Interaction nicht gefunden...")
            return;
        }
        if (interaction.guild == null) {
            logger.logSync("ERROR", "Guild nicht gefunden")
            return;
        }
        let role = await interaction.guild.roles.fetch(rId)
        if (role == null) {
            logger.logSync("ERROR", "Rolle nicht gefunden")
            return;
        }

        buttons.push(new discord.ActionRowBuilder<ButtonBuilder>().addComponents(
            new discord.ButtonBuilder()
                .setLabel(role.name)
                .setStyle(discord.ButtonStyle.Secondary)
                .setCustomId("do_nothing" + id_gen()),
            new discord.ButtonBuilder()
                .setLabel("+")
                .setCustomId(`addRole-${role.id}`)
                .setStyle(discord.ButtonStyle.Success),
            new discord.ButtonBuilder()
                .setLabel("-")
                .setCustomId(`removeRole-${role.id}`)
                .setStyle(discord.ButtonStyle.Danger)))
    }
    if (interaction.isRepliable()) interaction.reply({
        embeds: [
            new discord.EmbedBuilder()
                .setTitle("Toggle roles")
                .setDescription(
                    (buttons.length == 0) ? "Es sind keine Rollen verfügbar" : "Drücke die + oder - Buttons, um dir eine Rolle zu geben oder zu entfernen.")
                .setFooter({
                    text: "Kontaktiere einen Administrator oder Moderator, wenn du Hilfe brauchst."
                })
        ],
        components: [
            ...buttons
        ],
        ephemeral: (mode === "once")
    })
}

function id_gen() {
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    let result = "";
    for (let index = 0; index < 20; index++) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    return result;
}
