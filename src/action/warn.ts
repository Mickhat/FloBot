import { Client, CommandInteraction, EmbedBuilder, GuildMember, Colors } from "discord.js"
import { AsyncDatabase } from '../sqlite/sqlite'
import { v4 as uuid } from "uuid"
import { ILogger } from '../logger/logger'

export default async function (client: Client, interaction: CommandInteraction, logger: ILogger, db: AsyncDatabase, points: number, type: "WARN" | "STRIKE"): Promise<void> {
  const target = interaction.options.getMember('target') as GuildMember
  const reason = interaction.options.get('reason')?.value?.toString() ?? ''

  try {
    await db.run(`insert into records (uuid, dc_id, points, type, reason) VALUES (?, ?, ?, ?, ?)`, [uuid(), target.id, points, type, reason])
    logger.logSync("INFO", `Created a warn for ${target.id}`)
  } catch (e) {
    logger.logSync("ERROR", `Warn could not be entered in `)
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription('Der Warn / Strike ist fehlgeschlagen.')
      ],
      ephemeral: true
    })
    return
  }

  try {
    await target.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(type === "WARN" ? "Verwarnung" : "Verschärfte Warnung")
          .setDescription('Wir sind der Meinung, du hast gegen eine unserer Regeln verstoßen. Hiermit erhälst du eine Warnung. Wir bitten dich zukünftig, dich an unsere Regeln zu halten.')
          .addFields({ name: 'Grund', value: reason })
          .setColor(Colors.Yellow)
      ]
    })
    if (type === "STRIKE") {
      await target.send({
        embeds: [new EmbedBuilder()
          .setDescription('Merke, dass du spätestens bei der 4. verschärften Verwarnung vom Server ausgeschlossen wirst.')
          .setColor(Colors.Red)
        ]
      })
    }
  } catch (e) {
    logger.logSync("ERROR", `Person has not received the message`)
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${target.toString()} wurde verwarnt, konnte aber nicht benachrichtigt werden.`)
          .setColor(Colors.Yellow)
      ],
      ephemeral: true
    })
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`${target.toString()} wurde erfolgreich verwant.`)
    ],
    ephemeral: true
  })
}
