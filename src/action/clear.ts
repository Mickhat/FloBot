import { Client, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js"
import { AsyncDatabase } from '../sqlite/sqlite'
import { ILogger } from '../logger/logger'

export default async function (client: Client, interaction: CommandInteraction, logger: ILogger, db: AsyncDatabase): Promise<void> {
  const target = interaction.options.getMember('target') as GuildMember

  try {
    await db.allAsync(`DELETE FROM records WHERE dc_id = ?`, [target.id])
    logger.logSync("INFO", `Cleared History of ${target.id}`)
  } catch (e) {
    logger.logSync("ERROR", `Clear could not be entered in `)
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription('Der Clear ist fehlgeschlagen.')
      ],
      ephemeral: true
    })
    return
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`Historie von ${target.toString()} wurde von ${interaction.user.tag} geleert.`)
    ]
  })
}
