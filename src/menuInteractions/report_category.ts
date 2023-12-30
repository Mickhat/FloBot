import {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js'
import LogManager from '../logger/logger'
import { AsyncDatabase } from '../sqlite/sqlite'

export default {
  customId: /report_.+_category/,
  async execute(interaction: StringSelectMenuInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger('Report-System')
    const db = await AsyncDatabase.open()
    if (!db) {
      logger.logSync('ERROR', 'DB konnte nicht geöffnet werden.')
      return
    }
    const uuid = interaction.customId.split('_')[1]
    logger.logSync('DEBUG', `User-Report ${uuid} continue`)

    try {
      const result = await db.allAsync('SELECT uuid, reported_id, status, category FROM reports WHERE uuid = ?', [uuid])
      logger.logSync('DEBUG', `Daten von sqlite erhalten. Ergebniss: ${JSON.stringify(result)}`)
      logger.logSync('DEBUG', 'Update daten')
      await db.runAsync('UPDATE reports SET category = ? WHERE uuid = ?', [interaction.values[0], uuid])

      logger.logSync('DEBUG', 'Zeige modal')

      await interaction.showModal(
        new ModalBuilder()
          .setTitle('Report absenden')
          .setCustomId(`report_${uuid}_finish`)
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setLabel('Beschreibe bitte den Verstoß möglichst genau:')
                .setRequired(true)
                .setPlaceholder('Person war sehr böse')
                .setStyle(TextInputStyle.Paragraph)
                .setCustomId('description')
            )
          )
      )
    } catch (err) {
      await interaction.reply({
        content: 'ID existiert nicht. Bitte mache den Report von neu.',
        embeds: [new EmbedBuilder().setDescription(JSON.stringify(err, undefined, 2))],
        ephemeral: true
      })
    }
  }
}
