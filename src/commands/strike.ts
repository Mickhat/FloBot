import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js'
import LogManager from '../logger/logger'
import { AsyncDatabase } from '../sqlite/sqlite'
import { v4 as uuid } from 'uuid'

export default {
  data: new SlashCommandBuilder()
    .setName('strike')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Verwarnt eine Person und erteilt einen Strike.')
    .addUserOption((opt) =>
      opt.setName('target').setDescription('Die Person, die einen Strike bekommen soll').setRequired(true)
    )
    .addStringOption((opt) => opt.setName('reason').setDescription('Der Grund für den /strike').setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const logger = LogManager.getInstance().logger('StrikeCommand')
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'Database could not be opened.')
      return
    }
    const target = interaction.options.getMember('target') as GuildMember
    const reason = interaction.options.get('reason')?.value?.toString() ?? ''

    try {
      await db.run(`insert into records (uuid, dc_id, points, type, reason) VALUES (?, ?, ?, ?, ?)`, [
        uuid(),
        target.id,
        3,
        'STRIKE',
        reason
      ])
      logger.logSync('INFO', `Created a warn for ${target.id}`)
    } catch (e) {
      logger.logSync('ERROR', `Warn could not be entered in `)
      await interaction.reply({
        embeds: [new EmbedBuilder().setDescription('Der Warn / Strike ist fehlgeschlagen.')],
        ephemeral: true
      })
      return
    }

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Verschärfte Warnung')
            .setDescription(
              'Wir sind der Meinung, du hast gegen eine unserer Regeln verstoßen. Hiermit erhälst du eine Warnung. Wir bitten dich zukünftig, dich an unsere Regeln zu halten.'
            )
            .addFields({ name: 'Grund', value: reason })
            .setColor(Colors.Yellow)
        ]
      })
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              'Merke, dass du spätestens bei der 4. verschärften Verwarnung vom Server ausgeschlossen wirst.'
            )
            .setColor(Colors.Red)
        ]
      })
    } catch (e) {
      logger.logSync('ERROR', `Person has not received the message`)
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${target.toString()} wurde verwarnt, konnte aber nicht benachrichtigt werden.`)
            .setColor(Colors.Yellow)
        ],
        ephemeral: false
      })
    }

    await interaction.reply({
      embeds: [new EmbedBuilder().setDescription(`${target.toString()} wurde erfolgreich verwant.`)],
      ephemeral: false
    })
  }
}
