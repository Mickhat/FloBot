import discord from 'discord.js'
import { ILogger } from '../logger/logger'
import { v4 as uuid } from 'uuid'
import { AsyncDatabase } from 'src/sqlite/sqlite'

export default async (interaction: discord.MessageContextMenuCommandInteraction,
  client: discord.Client,
  db: AsyncDatabase,
  logger: ILogger): Promise<void> => {
  logger.logSync('INFO', 'New user report')

  const reportId = uuid()

  await interaction.reply({
    content: `Du bist dabei eine Nachricht zu reporten. Hier ist eine Vorschau des Berichts. Gebe bitte mehr Informationen an, damit wir schneller und geziehlter handeln können.
Setzt Du den Report fort und das Team stellt fest, das dieser bewusst falsch ist oder fahlässig versendet wurde, kannst Du selbst bestraft werden.`,
    embeds: [
      new discord.EmbedBuilder()
        .setAuthor({
          name: '🚩 REPORT-SYSTEM'
        })
        .setColor(discord.Colors.Red)
        .setTitle('Report')
        .setDescription('<Keine Beschreibung>')
        .addFields({ name: 'Absender', value: interaction.user.toString() },
          { name: 'Beschuldigt', value: interaction.targetMessage.member?.toString() ?? '<UNBEKANNT>' },
          { name: 'Regel', value: '<nicht gegeben>' },
          { name: 'ID', value: reportId },
          { name: 'Status', value: 'Bearbeitung' },
          {
            name: 'Nachricht',
            value: `${discord.escapeMarkdown(interaction.targetMessage.content)}
****
[Link zur Nachricht](${interaction.targetMessage.url})
`
          }
        )
    ],
    ephemeral: true,
    components: [
      new discord.ActionRowBuilder<discord.StringSelectMenuBuilder>()
        .addComponents(
          new discord.StringSelectMenuBuilder()
            .setCustomId(`report_${reportId}_category`)
            .setPlaceholder('Verstoßene Regel / Kategorie angeben')
            .addOptions(
              {
                label: '1 - Person nicht Pingbar', value: '1'
              },
              {
                label: '2 - NSWF im Namen',
                value: '2.1'
              },
              {
                label: '2 - NSWF im Profilbild',
                value: '2.2'
              },
              {
                label: '2 - NSWF im Status / AboutMe',
                value: '2.3'
              },
              {
                label: '2 - NSWF als Nachricht',
                value: '2.4'
              },
              {
                label: '3 - Private Daten eines Fremden',
                value: '2.5'
              },
              {
                label: '4 - Missbrauch von Channels',
                value: '4'
              },
              {
                label: '5 - Spamm',
                value: '5.1'
              },
              {
                label: '5 - unangebrachte Pings',
                value: '5.2'
              },
              {
                label: '6 - Bots',
                value: '5.3'
              },
              {
                label: '7 - Respektloser Umgang',
                value: '7'
              },
              {
                label: '9 - Werbung für andere Medien',
                value: '8'
              },
              {
                label: '10 - Starfumgehung',
                value: '10'
              },
              {
                label: '11 - Self-Botting',
                value: '11'
              },
              {
                label: '13 - schädliche oder ausführbare Dateien',
                value: '13'
              },
              {
                label: '15 - Verstoß Deutsches Recht',
                value: '15'
              },
              {
                label: '17 - Werbung',
                value: '17'
              },
              {
                label: 'anderweitiger Verstoß',
                value: '18'
              }

            )
        )
    ]
  })
  await db.runAsync(
    'INSERT INTO reports (uuid, creator_id, reported_id, status, category, message) VALUES (?, ?, ?, ?, \'UNKNOWN\', ?)',
    [reportId, interaction.user.id, interaction.targetMessage.author.id, 0, `${discord.escapeMarkdown(interaction.targetMessage.content)}
****
[Link zur Nachricht](${interaction.targetMessage.url})
`])
}
