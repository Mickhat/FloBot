import { Client, CommandInteraction, EmbedBuilder, GuildMember, Colors } from "discord.js"
import { AsyncDatabase } from '../sqlite/sqlite'
import { ILogger } from '../logger/logger'

export default async function (client: Client, interaction: CommandInteraction, logger: ILogger, db: AsyncDatabase): Promise<void> {
  const target = interaction.options.getMember('target') as GuildMember

  try {
    const resultban = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [target.id, 'BAN'])
    const resultkick = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [target.id, 'KICK'])
    const resultstrike = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [target.id, 'STRIKE'])
    const resultwarn = await db.allAsync(`SELECT * FROM records WHERE dc_id = ? AND type = ?`, [target.id, 'WARN'])

    const dataEmbed = new EmbedBuilder()
      .setTitle(`${target.displayName}`)
      .setThumbnail(`${target.displayAvatarURL()}`)
      .setDescription(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-plus-operands
        `Joined: ${target.joinedAt?.getDate()}.${(target.joinedAt?.getMonth() ?? 0) + 1}.${target.joinedAt?.getFullYear()}
        Anzahl Banns: ${resultban.length}
        Anzahl Kicks: ${resultkick.length}
        Anzahl Strikes: ${resultstrike.length}
        Anzahl Warns: ${resultwarn.length}
        `
      )
      .setColor(Colors.Yellow)
      .setTimestamp()
    resultban.forEach(row => {
      dataEmbed.addFields(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        { name: `Reason for ${row?.type} Weight: ${row?.points}`, value: `\b ${row?.reason}` }
      )
    })
    resultkick.forEach(row => {
      dataEmbed.addFields(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        { name: `Reason for ${row?.type} Weight: ${row?.points}`, value: `\b ${row?.reason}` }
      )
    })
    resultstrike.forEach(row => {
      dataEmbed.addFields(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        { name: `Reason for ${row?.type} Weight: ${row?.points}`, value: `\b ${row?.reason}` }
      )
    })
    resultwarn.forEach(row => {
      dataEmbed.addFields(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        { name: `Reason for ${row?.type}`, value: `\b ${row?.reason}` }
      )
    })
    logger.logSync("INFO", `History from ${target.id}`)
    await interaction.reply({
      embeds: [
        dataEmbed
      ]
    })
  } catch (e) {
    logger.logSync("ERROR", `History could not be entered in `)
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription('Abruf ist fehlgeschlagen.')
      ]
    })
  }
}
