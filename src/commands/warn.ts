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
import { v4 as uuid } from 'uuid'

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Verwarnt eine Person')
    .addUserOption((opt) =>
      opt.setName('target').setDescription('Die Person, die verwarnt werden soll').setRequired(true)
    )
    .addStringOption((opt) => opt.setName('reason').setDescription('Der Grund für den /warn').setRequired(true)),
  async execute(interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger('WarnCommand')
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
        1,
        'WARN',
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
            .setTitle('Verwarnung')
            .setDescription(
              'Wir sind der Meinung, du hast gegen eine unserer Regeln verstoßen. Hiermit erhälst du eine Warnung. Wir bitten dich zukünftig, dich an unsere Regeln zu halten.'
            )
            .addFields({ name: 'Grund', value: reason })
            .setColor(Colors.Yellow)
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
