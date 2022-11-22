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
    .setTitle("User wurde unbannt")
    .setDescription(`<@${target.toString()}> wurde erfolgreich unbannt. Angegebener Grund:  ${reason}`)
    .setColor('Red')
    .setAuthor({name: `Unbannt von: ${interaction.user.tag}`,})
    .setTimestamp()
    
    try {
        const dm = await client.users.fetch(target)
        await dm.send(`Du wurdest von Florian Dalwigk's Server unbannt.\nGrund: ${reason}`)    
        
        await interaction.guild?.members.unban(target)

        await interaction.reply({ embeds: [kickEmbed] })
        logger.logSync("Info", "Unbann wurde erfolgreich ausgefuehrt")
        logger.logSync("Info", `User <@${target.toString()}> wurde unbannt.Grund: ${reason}`)
    } catch (err) {
        logger.logSync("ERROR", `Unbann konnte nicht ausgefuehrt werden. ${err}`)

    }
}