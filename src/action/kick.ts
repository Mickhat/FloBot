import { Client, CommandInteraction, EmbedBuilder, escapeMarkdown } from 'discord.js'
import message from 'src/listeners/message';
import { Logger } from '../logger/logger'


export default async (client: Client, interaction: CommandInteraction, logger: Logger) => {

    if (!interaction.isRepliable() || !interaction.reply) {
        logger.logSync("ERROR", "Gegebene interaction kann nicht beantwortet werden.")
        return;
    }

    let target = interaction.options.get('target', true).value?.toString() || ""
    let reason = escapeMarkdown(interaction.options.get('reason', true).value?.toString() || "")

    let kickEmbed = new EmbedBuilder()
    .setTitle("User wurde gekickt")
    .setDescription(`<@${target.toString()}> wurde erfolgreich gekickt. Angegebener Grund:  ${reason}`)
    .setColor('Yellow')
    .setAuthor({name: `Gekickt von: ${interaction.user.tag}`,})
    .setTimestamp()
    
    const sleep = (ms: number | undefined) => new Promise(r => setTimeout(r, ms));
    client.users.fetch(target).then((dm =>
    dm.send(`Du wurdest von Florian Dalwigk's Server gekickt.\nGrund: ${reason}`))).catch(e => logger.logSync("ERROR", e))
    await sleep(250)
    try {
        
        await interaction.guild?.members.kick(target, reason)

        interaction.reply({ embeds: [kickEmbed] })
        logger.logSync("Info", "Kick wurde erfolgreich ausgefuehrt")
        logger.logSync("Info", `User <@${target.toString()}> wurde gekickt.Grund: ${reason}`)
    } catch (err) {
        logger.logSync("ERROR", `Kick konnte nicht ausgefuehrt werden. ${err}`)

    }
}