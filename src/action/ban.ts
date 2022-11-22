import { Client, CommandInteraction, EmbedBuilder, escapeMarkdown, Colors } from 'discord.js'
import { Logger } from '../logger/logger'

export default async (client: Client, interaction: CommandInteraction, logger: Logger): Promise<void> => {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const target = interaction.options.get('target', true).value?.toString() ?? ''
  const reason = escapeMarkdown(interaction.options.get('reason', true).value?.toString() ?? '')

  const banEmbed = new EmbedBuilder()
    .setTitle('User wurde gebannt')
    .setDescription(`<@${target.toString()}> wurde erfolgreich gebannt. Angegebener Grund:  ${reason}`)
    .setColor(Colors.Red)
    .setAuthor({ name: `Gebannt von: ${interaction.user.tag}` })
    .setTimestamp()

  try {
    const dm = await client.users.fetch(target)
    await dm.send(`Du wurdest von Florian Dalwigk's Server gebannt.\nGrund: ${reason}`)

    await interaction.guild?.members.ban(target)

    await interaction.reply({ embeds: [banEmbed] })
    logger.logSync('Info', 'Ban wurde erfolgreich ausgefuehrt')
    logger.logSync('Info', `User <@${target.toString()}> wurde gebannt.Grund: ${reason}`)
  } catch (err) {
    logger.logSync('ERROR', `Ban konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
  }
}
