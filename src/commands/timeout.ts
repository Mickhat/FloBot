import { Colors, CommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import ms from "ms"
import LogManager from "../logger/logger"
import { AsyncDatabase } from "../sqlite/sqlite"

export default {
  data: new SlashCommandBuilder().setName('timeout')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Versetzt eine Person in einem Timeout.')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die einen Timeout erhalten soll')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('zeit')
        .setDescription('Wie lange soll der Timeout sein?')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('reason')
        .setDescription('Der Grund für den Timeout')
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger("TimeoutCommand")
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }
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
}
