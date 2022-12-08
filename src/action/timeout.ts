import { Client, Colors, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'
import ms from 'ms'
import { AsyncDatabase } from 'src/sqlite/sqlite'
import { ILogger } from '../logger/logger'

export default async (client: Client, interaction: CommandInteraction, logger: ILogger, db: AsyncDatabase): Promise<void> => {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const reason = interaction.options.get('reason', true).value?.toString() ?? ''
  const member = interaction.options.getMember('target') as GuildMember
  const zeit = ms(interaction.options.get('zeit')?.value as string)

  const embed = new EmbedBuilder()
    .setTitle('User hat einen Timeout bekommen')
    .setDescription(`<@${member.id}> hat einen Timeout bekommen.`)
    .setColor(Colors.Yellow)
    .addFields({ name: 'Grund', value: reason })
    .setAuthor({ name: `Timeout durch ${interaction.user.tag}` })
    .setTimestamp()

  try {
    await member?.timeout(zeit, reason)
    await interaction.reply({ embeds: [embed], ephemeral: false })
  } catch (err) {
    logger.logSync('ERROR', `Timeout konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
    await interaction.reply({
      embeds: [new EmbedBuilder().setDescription('Timeout fehlgeschlagen')], ephemeral: false
    })
  }
}
