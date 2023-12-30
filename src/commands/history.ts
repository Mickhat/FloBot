import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js'
import LogManager from '../logger/logger'
import { AsyncDatabase } from '../sqlite/sqlite'

export default {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Sieht die Historie eines Users ein')
    .addUserOption((opt) =>
      opt.setName('target').setDescription('Die Person, dessen Historie eingesehen werden soll').setRequired(true)
    ),
  async execute(interaction: CommandInteraction): Promise<void> {
    const target = interaction.options.getMember('target') as GuildMember
    const logger = LogManager.getInstance().logger('HistoryCommand')
    const db = await AsyncDatabase.open()

    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }

    try {
      const resultban = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [target.id, 'BAN'])
      const resultkick = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [target.id, 'KICK'])
      const resultstrike = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [
        target.id,
        'STRIKE'
      ])
      const resultwarn = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [target.id, 'WARN'])
      const result = await db.allAsync(`SELECT points FROM records WHERE dc_id = ?`, [target.id])
      let gespoints = 0
      result.forEach((row) => {
        gespoints = gespoints + parseInt(row?.points)
      })
      const dataEmbed = new EmbedBuilder()
        .setTitle(`${target.displayName}`)
        .setThumbnail(`${target.displayAvatarURL()}`)
        .setDescription(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-plus-operands
          `Joined: ${target.joinedAt?.getDate()}.${
            (target.joinedAt?.getMonth() ?? 0) + 1
          }.${target.joinedAt?.getFullYear()}
        Anzahl Banns: ${resultban.length}
        Anzahl Kicks: ${resultkick.length}
        Anzahl Strikes: ${resultstrike.length}
        Anzahl Warns: ${resultwarn.length}
        Anzahl Points: ${gespoints}
        `
        )
        .setColor(Colors.Yellow)
        .setTimestamp()
      dataEmbed.addFields({ name: '\u200b', value: '__Kicks__' })
      resultkick.forEach((row) => {
        dataEmbed.addFields(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          { name: `Grund:`, value: `\b ${row?.reason}` }
        )
      })
      dataEmbed.addFields({ name: '\u200b', value: '__Strikes__' })
      resultstrike.forEach((row) => {
        dataEmbed.addFields(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          { name: `Grund:`, value: `\b ${row?.reason}` }
        )
      })
      dataEmbed.addFields({ name: '\u200b', value: '__Warns__' })
      resultwarn.forEach((row) => {
        dataEmbed.addFields(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          { name: `Grund:`, value: `\b ${row?.reason}` }
        )
      })
      // Banns
      /* dataEmbed.addFields({ name: '\u200b', value: '__Banns__' })
      resultban.forEach(row => {
        dataEmbed.addFields(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          { name: `Grund:`, value: `\b ${row?.reason}` }
        )
      }) */
      logger.logSync('INFO', `History from ${target.id}`)
      await interaction.reply({
        embeds: [dataEmbed]
      })
    } catch (e) {
      logger.logSync('ERROR', `History could not be entered in `)
      await interaction.reply({
        embeds: [new EmbedBuilder().setDescription('Abruf ist fehlgeschlagen.')]
      })
    }
  }
}
