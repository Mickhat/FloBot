import { CommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import LogManager from "../logger/logger"
import { AsyncDatabase } from "../sqlite/sqlite"

export default {
  data: new SlashCommandBuilder().setName('clear')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Leert die Historie eines Users')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, dessen Historie geleert werden soll')
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction): Promise<void> {
    const target = interaction.options.getMember('target') as GuildMember
    const logger = LogManager.getInstance().logger('ClearCommand')
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }
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
}
