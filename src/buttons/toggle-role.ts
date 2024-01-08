import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js'
import { AsyncDatabase } from 'src/sqlite/sqlite'

export default {
  buttonId: /toggle-role/,
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'An error occurred while trying to get the guild.',
        ephemeral: true
      })
      return
    }
    const db = await AsyncDatabase.open()
    if (!db) {
      await interaction.reply({
        content: 'An error occurred while trying to open the database.',
        ephemeral: true
      })
      return
    }

    const dbEntry = await db.getAsync(`SELECT * FROM button_roles WHERE message_id = ?`, [interaction.message.id])
    if (!dbEntry || dbEntry.message_id !== interaction.message.id || !dbEntry.role_id) {
      await interaction.reply({
        content: 'An error occurred while trying to get the database entry.',
        ephemeral: true
      })
      await interaction.message.edit({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('Es war ein Mal ein Button...')
            .setDescription(
              'und mit diesem Button konnte man sich eine Rolle geben. Doch ein böser Fehler hat dem Button seine Magie genommen. Nun ist er in Rente und lebt einsam in diesem Channel. Und wenn er nicht gelöscht worden ist, dann lebt er hier noch heute.'
            )
            .setFooter({
              text: 'Es ist ein Fehler in der Datenbank aufgetreten. Bitte melde dies einem Administrator.'
            })
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
              .setCustomId('toggle-role')
              .setLabel('Rolle geben/entfernen')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          ])
        ]
      })
      return
    }

    const role = await interaction.guild.roles.fetch(dbEntry.role_id)
    if (!role || role.id !== dbEntry.role_id) {
      await interaction.reply({
        content: 'An error occurred while trying to get the role.',
        ephemeral: true
      })
      return
    }

    if (!interaction.member) {
      await interaction.reply({
        content: 'An error occurred while trying to get the member.',
        ephemeral: true
      })
      return
    }

    const member = await interaction.guild.members.fetch(interaction.user.id)
    if (!member || member.id !== interaction.user.id) {
      await interaction.reply({
        content: 'An error occurred while trying to get the member.',
        ephemeral: true
      })
      return
    }

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role)
      await interaction.reply({
        content: `Du hast dir die Rolle @${role.name} entfernt.`,
        ephemeral: true
      })
    } else {
      await member.roles.add(role)
      await interaction.reply({
        content: `Du hast dir die Rolle @${role.name} gegeben.`,
        ephemeral: true
      })
    }
  }
}
