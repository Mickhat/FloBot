import { Colors, CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import LogManager from "../logger/logger"
import { AsyncDatabase } from "../sqlite/sqlite"
import { v4 as uuid } from "uuid"

export default {
  data: new SlashCommandBuilder().setName('ban')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription('Entfernt eine Person final vom Server')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die gebannt werden soll')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('reason')
        .setDescription('Der Grund für den /ban')
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger('BanCommand')
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }

    const target = interaction.options.get('target', true).value?.toString() ?? ''
    const reason = interaction.options.get('reason', true).value?.toString() ?? ''
    let dmSucess: boolean

    // record
    try {
      await db.runAsync('INSERT INTO records (uuid, dc_id, type, points, reason) VALUES (?, ?, \'BAN\', 0, ?)', [
        uuid(), target, reason
      ])
    } catch (e) {
      logger.logSync('ERROR', `SQLITE-ERROR: ${JSON.stringify(e)}`)
    }

    // send dm
    try {
      const dm = await interaction.client.users.fetch(target)
      await dm.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Ban')
            .setDescription('Es tut uns sehr leid, jedoch sind wir gezwungen dich aufgrund deines Verhaltens vom Server auszuschließen. Bist du der Meinung, zu unrecht gebannt worden zu sein, melde dich bitte bei uns persönlich.')
            .addFields(
              { name: 'Grund', value: reason }
            )
            .setColor(Colors.Red)
        ]
      })
      dmSucess = true
    } catch (e) {
      dmSucess = false
    }

    try {
      await interaction.guild?.members.ban(target, { reason })
      logger.logSync("INFO", `Nutzer mit der ID ${target} wurde gebannt.`)
    } catch (e) {
      logger.logSync('ERROR', `Ban ${target} konnte nicht ausgefuehrt werden. ${JSON.stringify(e)}`)
      await interaction.reply({
        ephemeral: false,
        content: 'Der Ban war erfolgslos.'
      })
      return
    }

    try {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('User wurde gebannt')
          .setDescription((dmSucess) ? `<@${target.toString()}> wurde erfolgreich benachrichtigt und gebannt.` : `<@${target.toString()}> wurde erfolgreich gebannt. Die Benachrichtigung konnte nicht versendet werden.`)
          .setColor(Colors.Red)
          .setAuthor({ name: `Gebannt von: ${interaction.user.tag}` })
          .addFields({ name: 'Grund', value: reason })
          .setTimestamp()],
        ephemeral: false
      })
    } catch (e) {
      logger.logSync("ERROR", 'Interaction could not be replied.')
    }
  }
}
