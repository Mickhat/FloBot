import { Client, CommandInteraction, EmbedBuilder, Colors } from 'discord.js'
import { ILogger } from '../logger/logger'

export default async (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> => {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const target = interaction.options.get('target', true).value?.toString() ?? ''

  const dmDisabled = new EmbedBuilder()
    .setTitle('User wurde entbannt')
    .setDescription(`<@${target.toString()}> hat seine DMS deaktiviert.`)
    .setColor(Colors.Green)
    .setAuthor({ name: `Entbannt von: ${interaction.user.tag}` })
    .setTimestamp()

  try {
    await interaction.guild?.members.unban(target)
    await interaction.reply({ embeds: [dmDisabled] })

    logger.logSync('INFO', 'Entbannung wurde erfolgreich ausgefuehrt')
    logger.logSync('INFO', `User <@${target.toString()}> wurde entbannt.`)
  } catch (err) {
    logger.logSync('ERROR', `Entbannung konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
  }
}
