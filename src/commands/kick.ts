import { Colors, CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import LogManager from '../logger/logger'
import { AsyncDatabase } from '../sqlite/sqlite'
import { v4 as uuid } from 'uuid'

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Kickt eine Person vom Server.')
    .addUserOption((opt) =>
      opt.setName('target').setDescription('Die Person, die gekickt werden soll').setRequired(true)
    )
    .addStringOption((opt) => opt.setName('reason').setDescription('Der Grund für den kick').setRequired(true)),
  async execute(interaction: CommandInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger('KickCommand')
    const db = await AsyncDatabase.open()

    if (!db) {
      logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
      return
    }

    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }

    const target = interaction.options.get('target', true).value?.toString() ?? ''
    const reason = interaction.options.get('reason', true).value?.toString() ?? ''
    let dmSucess: boolean

    const kickEmbed = new EmbedBuilder()
      .setTitle('User wurde gekickt')
      .setDescription(`<@${target}> wurde erfolgreich gekickt und wurde benachrichtigt.`)
      .setColor('Yellow')
      .setAuthor({ name: `Gekickt von: ${interaction.user.username}` })
      .setTimestamp()

    const dmDisabled = new EmbedBuilder()
      .setTitle('User wurde gekickt')
      .setDescription(`<@${target}> wurde erfolgreich gekickt. Die Benachrichtigung konnte nicht verschickt werden.`)
      .setColor('Yellow')
      .setAuthor({ name: `Gekickt von: ${interaction.user.username}` })
      .setTimestamp()
      .addFields({ name: 'Grund', value: reason })

    try {
      await db.runAsync("INSERT INTO records (uuid, dc_id, type, points, reason) VALUES (?, ?, 'KICK', 0, ?)", [
        uuid(),
        target,
        reason
      ])
    } catch (e) {
      logger.logSync('ERROR', `SQLITE-ERROR: ${JSON.stringify(e)}`)
    }

    try {
      await (
        await interaction.client.users.fetch(target)
      ).send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Kick')
            .setDescription(
              'Aufgrund deines Verhaltens wurdest du vom Server gekickt. Wir bitten dich zukünftig unsere Regeln zu beachten. Bist du der Meinung, zu unrecht gekickt worden zu sein, melde dich bitte bei uns persönlich.'
            )
            .addFields({ name: 'Grund', value: reason })
            .setColor(Colors.Red)
        ]
      })
      dmSucess = true
    } catch (e) {
      dmSucess = false
    }

    try {
      await interaction.guild?.members.kick(target, reason)
      logger.logSync('INFO', `Nutzer mit ID ${target} wurde gekickt.`)
    } catch (e) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setDescription('Der Kick ist fehlgeschlagen.')],
        ephemeral: false
      })
      return
    }

    try {
      if (dmSucess) {
        await interaction.reply({ embeds: [kickEmbed], ephemeral: false })
      } else {
        await interaction.reply({ embeds: [dmDisabled], ephemeral: false })
      }
    } catch (e) {
      logger.logSync('ERROR', 'Interaction konnte nicht beantwortet werden.')
    }
  }
}
