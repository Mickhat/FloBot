import { randomInt } from "crypto"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js"
import LogManager from "../logger/logger"
import { AsyncDatabase } from "../sqlite/sqlite"

type giveawayStatus = 0 | 1
const GIVEAWAY_STATUS: { OPENED: giveawayStatus, CLOSED: giveawayStatus } = { OPENED: 0, CLOSED: 1 }

export default {
  data: new SlashCommandBuilder().setName('giveaway-eval')
    .setDescription('Ein Giveaway auswerten')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addStringOption(
      o => o.setName('messageid')
        .setDescription('Die ID der Nachricht vom Bot in dem der Giveaway verkündet wurde')
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger("GiveawayCommand")
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const dc_id = interaction.user.id
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ga_id = interaction.options.get('messageid', true).value?.toString() ?? 'ERROR'
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const giveaway_obj = await db.getAsync(`SELECT message_id, prize, timestamp, status, organizer_id FROM giveaways WHERE message_id = ? AND organizer_id = ?`, [ga_id, dc_id])
    if (!giveaway_obj || giveaway_obj.status !== GIVEAWAY_STATUS.OPENED) {
      await interaction.reply({ content: 'ERROR. Dir fehlt die Berechtigung oder das Giveaway existiert nicht. Wer weiß?', ephemeral: true })
      return
    }
    const channel = interaction.channel as TextChannel
    const message = await channel?.messages.fetch(ga_id)
    if (!message) {
      await interaction.reply({ content: 'ERROR. Giveaway gibt es nicht', ephemeral: true })
      return
    }
    const teilnehmer = await db.allAsync(`SELECT giveaway_message_id, dc_id FROM giveaway_participants WHERE giveaway_message_id = ?`, [ga_id])
    let winner = 'niemand'
    if (teilnehmer.length > 0) winner = teilnehmer[randomInt(teilnehmer.length)]?.dc_id as string
    await db.runAsync(`UPDATE giveaways SET status = ? WHERE message_id = ? AND organizer_id = ?`, [GIVEAWAY_STATUS.CLOSED, ga_id, dc_id])
    await db.runAsync(`DELETE FROM giveaways WHERE message_id = ? AND organizer_id = ? AND status = ?`, [ga_id, dc_id, GIVEAWAY_STATUS.CLOSED])
    await db.runAsync(`DELETE FROM giveaway_participants WHERE giveaway_message_id = ?`, [ga_id])
    await message.edit({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Teilnehmen")
            .setEmoji('🎉')
            .setCustomId('giveaway-participate')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        )
      ],
      embeds: [
        new EmbedBuilder()
          .setTitle('Altes Giveaway')
          .addFields(
            { name: 'Gewinn:', value: giveaway_obj.prize },
            { name: 'Endete:', value: `<t:${Math.floor(new Date().getTime() / 1000)}:t>` },
            { name: 'Gewinner:', value: `<@${winner}>` },
            { name: 'Teilnehmeranzahl:', value: `${teilnehmer.length}` }
          )
          .setFooter({ iconURL: interaction.client.user?.avatarURL() ?? undefined, text: 'PlaceholderBot' })
          .setTimestamp(Math.floor(giveaway_obj.timestamp / 1000))
      ]
    })
    await interaction.reply(
      {
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('Giveaway wurde beendet')
        ],
        ephemeral: true
      })
  }
}
