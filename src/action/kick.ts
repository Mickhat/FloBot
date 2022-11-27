import { Client, CommandInteraction, EmbedBuilder, escapeMarkdown } from 'discord.js'
import { AsyncDatabase } from 'src/sqlite/sqlite'
import { ILogger } from '../logger/logger'

export default async (client: Client, interaction: CommandInteraction, logger: ILogger, db: AsyncDatabase): Promise<void> => {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const target = interaction.options.get('target', true).value?.toString() ?? ''
  const reason = escapeMarkdown(interaction.options.get('reason', true).value?.toString() ?? '')

  const kickEmbed = new EmbedBuilder()
    .setTitle('User wurde gekickt')
    .setDescription(`<@${target}> wurde erfolgreich gekickt und wurde benachrichtigt.`)
    .setColor('Yellow')
    .setAuthor({ name: `Gekickt von: ${interaction.user.tag}` })
    .setTimestamp()

  const dmDisabled = new EmbedBuilder()
    .setTitle('User wurde gekickt')
    .setDescription(`<@${target}> wurde erfolgreich gekickt. Die Banachrichtigung konnte nicht verschickt werden.`)
    .setColor('Yellow')
    .setAuthor({ name: `Gekickt von: ${interaction.user.tag}` })
    .setTimestamp()
    .addFields({ name: 'Grund', value: reason })

  try {
    try {
      const dm = await client.users.fetch(target)
      await dm.send(`Du wurdest von Florian Dalwigk's Server gekickt.\nAngegebener Grund: ${reason}`)
      await interaction.reply({ embeds: [kickEmbed] })
    } catch (err) {
      await interaction.reply({ embeds: [dmDisabled] })
    }
    await interaction.guild?.members.kick(target, reason)

    logger.logSync('INFO', 'Kick wurde erfolgreich ausgefuehrt')
    logger.logSync('INFO', `User <@${target.toString()}> wurde gekickt.Grund: ${reason}`)
  } catch (err) {
    logger.logSync('ERROR', `Kick konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
  }
}
