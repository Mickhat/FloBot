import { Client, CommandInteraction, EmbedBuilder, escapeMarkdown, GuildMember } from 'discord.js'
import ms from 'ms'
import { Logger } from '../logger/logger'

export default async (client: Client, interaction: CommandInteraction, logger: Logger): Promise<void> => {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const reason = escapeMarkdown(interaction.options.get('reason', true).value?.toString() ?? '')
  const member = interaction.options.getMember('target') as GuildMember
  const zeit = ms(interaction.options.get('zeit')?.value as string)

  const embed = new EmbedBuilder()
    .setTitle('User hat einen Timeout bekommen')
    .setDescription(`<@${member.id}> hat einen Timeout bekommen.\nAngegebener Grund:  ${reason}`)
    .setColor('Yellow')
    .setAuthor({ name: `Timeout durch ${interaction.user.tag}` })
    .setTimestamp()

  try {
    await member?.timeout(zeit)

    await interaction.reply({ embeds: [embed] })
  } catch (err) {
    logger.logSync('ERROR', `Timeout konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
  }
}
