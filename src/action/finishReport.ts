import { ChannelType, Client, Colors, EmbedBuilder, ModalSubmitInteraction } from 'discord.js'
import { Database } from 'sqlite3'
import { Logger } from '../logger/logger'

export default async (interaction: ModalSubmitInteraction, client: Client, db: Database, logger: Logger): Promise<void> => {
  const uuid = interaction.customId.split('_')[1]
  console.log(`Report ${interaction.customId} ${uuid}`)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  db.get('SELECT uuid, reported_id, status, category, message FROM reports WHERE uuid = ?', [uuid], async (err, result) => {
    if (err != null) return await interaction.reply('ID existiert nicht. Bitte mache den Report von neu.')
    db.run('UPDATE reports SET description = ? WHERE uuid = ?', [
      interaction.fields.getTextInputValue('description'), uuid
    ])

    await interaction.reply({
      content: 'Dein Report wurde an das Mod-Team übermittelt. Du kannst im neu erstellten Ticket Datails, Screenshots und ähnliches teilen.',
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: '🚩 REPORT-SYSTEM'
          })
          .setColor(Colors.Red)
          .setTitle('Report')
          .setDescription(interaction.fields.getTextInputValue('description'))
          .addFields(
            {
              name: 'Absender',
              value: `${interaction.member?.user.username as string}#${interaction.member?.user.discriminator as string} <@${interaction.member?.user.id as string}> #${interaction.member?.user.id as string}`
            },
            {
              name: 'Beschuldigt',
              value: (await interaction.guild?.members.fetch(result?.reported_id ?? '') ?? '<ERROR>').toString()
            },
            {
              name: 'Regel',
              value: result?.category ?? '<ERROR>'
            },
            {
              name: 'ID',
              value: result?.uuid ?? '<ERROR>'
            },
            {
              name: 'Status',
              value: 'Fertig'
            },
            {
              name: 'Verlinkte Nachricht',
              value: result.message ?? '<_NULL_>'
            }
          )
      ],
      ephemeral: true
    })

    await interaction.guild?.channels.fetch(process.env.REPORT_CHANNEL_ID ?? '').then(async (channel) => {
      if ((channel == null) || channel?.type !== ChannelType.GuildText) {
        logger.logSync('ERROR', 'Channel not found / not TextBased')
        return
      }
      await channel.send({
        content: 'Ein Report wurde erstellt.',
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: '🚩 REPORT-SYSTEM'
            })
            .setColor(Colors.Red)
            .setTitle('Report')
            .setDescription(interaction.fields.getTextInputValue('description'))
            .addFields(
              {
                name: 'Absender',
                value: interaction.member?.toString() ?? ''
              },
              {
                name: 'Beschuldigt',
                value: (((await interaction.guild?.members.fetch(result?.reported_id)) != null) || '<ERROR>').toString()
              },
              {
                name: 'Regel',
                value: result?.category ?? '<ERROR>'
              },
              {
                name: 'ID',
                value: result?.uuid ?? '<ERROR>'
              },
              {
                name: 'Status',
                value: 'Fertig'
              },
              {
                name: 'Verlinkte Nachricht',
                value: result?.message ?? '<NULL>'
              }
            )
        ]
      })
    })
  })
}
