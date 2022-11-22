import { Client, CommandInteraction, EmbedBuilder, escapeMarkdown, Colors } from 'discord.js'
import { Logger } from '../logger/logger'


export default async (client: Client, interaction: CommandInteraction, logger: Logger) => {

    if (!interaction.isRepliable() || !interaction.reply) {
        logger.logSync("ERROR", "Gegebene interaction kann nicht beantwortet werden.")
        return;
    }

    let target = interaction.options.get('target', true).value?.toString() || ""
    let reason = escapeMarkdown(interaction.options.get('reason', true).value?.toString() || "")

    let unbanEmbed = new EmbedBuilder()
    .setTitle("User wurde entbannt")
    .setDescription(`<@${target.toString()}> wurde erfolgreich entbannt. Angegebener Grund:  ${reason}`)
    .setColor(Colors.Green)
    .setAuthor({name: `Entbannt von: ${interaction.user.tag}`,})
    .setTimestamp()
    
    try {
        const dm = await client.users.fetch(target)
        await dm.send(`Du wurdest von Florian Dalwigk's Server entbannt.\nGrund: ${reason}`)    
        
        await interaction.guild?.members.unban(target)

        await interaction.reply({ embeds: [unbanEmbed] })
        logger.logSync("Info", "Entbannung wurde erfolgreich ausgefuehrt")
        logger.logSync("Info", `User <@${target.toString()}> wurde entbannt.Grund: ${reason}`)
    } catch (err) {
        logger.logSync("ERROR", `Entbannung konnte nicht ausgefuehrt werden. ${err}`)

    }
}