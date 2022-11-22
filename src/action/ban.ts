import { Client, CommandInteraction, EmbedBuilder, escapeMarkdown } from 'discord.js'
import { Logger } from '../logger/logger'


export default async (client: Client, interaction: CommandInteraction, logger: Logger) => {

    if (!interaction.isRepliable() || !interaction.reply) {
        logger.logSync("ERROR", "Gegebene interaction kann nicht beantwortet werden.")
        return;
    }

    let target = interaction.options.get('target', true).value?.toString() || ""
    let reason = escapeMarkdown(interaction.options.get('reason', true).value?.toString() || "")

    let kickEmbed = new EmbedBuilder()
    .setTitle("User wurde gebannt")
    .setDescription(`<@${target.toString()}> wurde erfolgreich gebannt. Angegebener Grund:  ${reason}`)
    .setColor('Red')
    .setAuthor({name: `Gebannt von: ${interaction.user.tag}`,})
    .setTimestamp()
    
    try {
        const dm = await client.users.fetch(target)
        await dm.send(`Du wurdest von Florian Dalwigk's Server gebannt.\nGrund: ${reason}`)    
        
        await interaction.guild?.members.ban(target)

        await interaction.reply({ embeds: [kickEmbed] })
        logger.logSync("Info", "Ban wurde erfolgreich ausgefuehrt")
        logger.logSync("Info", `User <@${target.toString()}> wurde gebannt.Grund: ${reason}`)
    } catch (err) {
        logger.logSync("ERROR", `Ban konnte nicht ausgefuehrt werden. ${err}`)

    }
}