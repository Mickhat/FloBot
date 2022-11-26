import { Client, CommandInteraction, EmbedBuilder, escapeMarkdown } from 'discord.js'
import { Logger } from '../logger/logger'

export default async (client: Client, interaction: CommandInteraction, logger: Logger): Promise<void> => {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const target = interaction.options.get('target', true).value?.toString() ?? ''
  const reason = escapeMarkdown(interaction.options.get('reason', true).value?.toString() ?? '')

  const kickEmbed = new EmbedBuilder()
    .setTitle('User wurde gekickt')
    .setDescription(`<@${target.toString()}> wurde erfolgreich gekickt. Angegebener Grund:  ${reason}`)
    .setColor('Yellow')
    .setAuthor({ name: `Gekickt von: ${interaction.user.tag}` })
    .setTimestamp()

  const dmDisabled = new EmbedBuilder()
    .setTitle('User wurde gekickt')
    .setDescription(`<@${target.toString()}> hat seine DMS deaktiviert.\nAngegebener Grund: ${reason}`)
    .setColor('Yellow')
    .setAuthor({ name: `Gekickt von: ${interaction.user.tag}` })
    .setTimestamp()

  try {
    try {
      const dm = await client.users.fetch(target)
      await dm.send(`Du wurdest von Florian Dalwigk's Server gekickt.\nAngegebener Grund: ${reason}`)
      await interaction.reply({ embeds: [kickEmbed] })
    } catch (err) {
      await interaction.reply({ embeds: [dmDisabled] })
    }
    await interaction.guild?.members.kick(target, reason)

    logger.logSync('Info', 'Kick wurde erfolgreich ausgefuehrt')
    logger.logSync('Info', `User <@${target.toString()}> wurde gekickt.Grund: ${reason}`)
  } catch (err) {
    logger.logSync('ERROR', `Kick konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
  }
}
