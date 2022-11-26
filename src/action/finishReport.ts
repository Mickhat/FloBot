import { ChannelType, Client, Colors, EmbedBuilder, ModalSubmitInteraction } from 'discord.js'
import { AsyncDatabase } from 'src/sqlite/sqlite'
import { ILogger } from '../logger/logger'

export default async (interaction: ModalSubmitInteraction, client: Client, db: AsyncDatabase, logger: ILogger): Promise<void> => {
  const uuid = interaction.customId.split('_')[1]
  console.log(`Report ${interaction.customId} ${uuid}`)

  let result
  try {
    result = await db.getAsync('SELECT uuid, reported_id, status, category, message FROM reports WHERE uuid = ?', [uuid])
  } catch (err) {
    await interaction.reply('ID existiert nicht. Bitte mache den Report von neu.')
    return
  }

  await db.runAsync('UPDATE reports SET description = ? WHERE uuid = ?', [
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

  const channel = await interaction.guild?.channels.fetch(process.env.REPORT_CHANNEL_ID ?? '')
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
            value: result?.message ?? '<NULL>'
          }
        )
    ]
  })
}
