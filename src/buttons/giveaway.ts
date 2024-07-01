import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js'
import ms from 'ms'
import LogManager from '../logger/logger'
import { AsyncDatabase } from '../sqlite/sqlite'

type giveawayStatus = 0 | 1
const GIVEAWAY_STATUS: { OPENED: giveawayStatus; CLOSED: giveawayStatus } = { OPENED: 0, CLOSED: 1 }

export default {
  buttonId: /giveaway-participate/,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger('GiveawayButton')
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const dc_id = interaction.user.id
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ga_id = interaction.message.id
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const giveaway_obj = await db.getAsync(
      `SELECT message_id, timestamp, status, prize FROM giveaways WHERE message_id = ?`,
      [ga_id]
    )
    if (!giveaway_obj || giveaway_obj.status !== GIVEAWAY_STATUS.OPENED) {
      await interaction.reply({ content: 'Schlechter Versuch. Das gibt ein Timeout.' })
      if (interaction.inGuild()) {
        await (
          await interaction.guild?.members.fetch(interaction.user.id)
        )?.timeout(ms('24h'), 'Hat versucht Giveaway zu hacken. (vllt, maybe, kann sein)')
      }
      return
    }
    if (!giveaway_obj.timestamp || giveaway_obj.timestamp < new Date().getTime()) {
      await interaction.reply({ content: 'Du bist zu spät.', ephemeral: true })
      return
    }
    const channel = interaction.channel as TextChannel
    const message = await channel?.messages.fetch(ga_id)
    if (!message) {
      await interaction.reply({ content: 'ERROR. Giveaway gibt es nicht', ephemeral: true })
      return
    }
    const hash = dc_id + ga_id /* Sollte mal ein Hash sein, ist aber keiner (nicht wundern) */
    await db.runAsync(`INSERT INTO giveaway_participants(dc_id, giveaway_message_id, hash) VALUES(?,?,?)`, [
      dc_id,
      ga_id,
      hash
    ])
    await interaction.reply({ content: 'Du nimmst beim Giveaway teil', ephemeral: true })
    const teilnehmer = await db.allAsync(
      `SELECT count(*) as count FROM giveaway_participants WHERE giveaway_message_id = ?`,
      [ga_id]
    )
    const numberOfParticipants = teilnehmer[0]?.count as number
    const gaTimestamp = Math.floor(giveaway_obj.timestamp / 1000)
    await message.edit({
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
            { name: 'Gewinn:', value: giveaway_obj.prize },
            { name: 'Endet:', value: `<t:${gaTimestamp}:R> <t:${gaTimestamp}:d> <t:${gaTimestamp}:T>` },
            { name: 'Teilnehmer:', value: `${numberOfParticipants + 1}` }
          )
          .setFooter({ iconURL: interaction.client.user?.avatarURL() ?? undefined, text: 'PlaceholderBot' })
          .setTimestamp(gaTimestamp)
      ]
    })
  }
}
