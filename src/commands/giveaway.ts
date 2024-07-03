import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Colors
} from 'discord.js'
import ms from 'ms'
import LogManager from '../logger/logger'
import { AsyncDatabase } from '../sqlite/sqlite'

type giveawayStatus = 0 | 1
const GIVEAWAY_STATUS: { OPENED: giveawayStatus; CLOSED: giveawayStatus } = { OPENED: 0, CLOSED: 1 }

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Etwas verlosen')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addStringOption((o) => o.setName('item').setDescription('Was soll verlost werden.').setRequired(true))
    .addStringOption((o) =>
      o.setName('time').setDescription('Wie lange soll das Giveaway gehen? Default: 24h').setRequired(false)
    ),
  async execute(interaction: CommandInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger('GiveawayCommand')
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }
    const giveawayBy = interaction.member as GuildMember
    const giveawayTime = ms(interaction.options.get('time', false)?.value?.toString() ?? '24h') || ms('24h')
    const giveawayItem = interaction.options.get('item', true).value?.toString() ?? 'nothing'
    const timestamp = Math.floor((new Date().getTime() + giveawayTime) / 1000)
    const giveawayMessage = await interaction.reply({
      ephemeral: false,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('Teilnehmen')
            .setEmoji('🎉')
            .setCustomId('giveaway-participate')
            .setStyle(ButtonStyle.Primary)
        )
      ],
      embeds: [
        new EmbedBuilder()
          .setTitle('Neues Giveaway')
          .addFields(
            { name: 'Gewinn:', value: giveawayItem },
            { name: 'Endet:', value: `<t:${timestamp}:R> - <t:${timestamp}>` },
            { name: 'Teilnehmer:', value: '0' }
          )
          .setColor(Colors.Green)
      ],
      fetchReply: true
    })
    const channelId = interaction.channelId
    await db.runAsync(
      `INSERT INTO giveaways(message_id, organizer_id, prize, status, timestamp, channel_id, author_display_name, author_avatar_url) VALUES(?,?,?,?,?,?,?,?)`,
      [
        giveawayMessage.id,
        interaction.member?.user.id ?? '<ERROR>',
        giveawayItem,
        GIVEAWAY_STATUS.OPENED,
        timestamp * 1000,
        channelId,
        giveawayBy.displayName,
        giveawayBy.avatarURL()
      ]
    )
  }
}
