import { randomInt } from "crypto"
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, Colors, CommandInteraction, EmbedBuilder, GuildMember, TextChannel } from "discord.js"
import ms from "ms"
import LogManager from "src/logger/logger"
import { AsyncDatabase } from "src/sqlite/sqlite"

type giveawayStatus = 0 | 1
const GIVEAWAY_STATUS: { OPENED: giveawayStatus, CLOSED: giveawayStatus } = { OPENED: 0, CLOSED: 1 }

export async function createGiveaway (client: Client, interaction: CommandInteraction, db: AsyncDatabase): Promise<void> {
  const giveawayBy = interaction.member as GuildMember
  const giveawayTime = ms(interaction.options.get('time', false)?.value?.toString() ?? '24h') || ms('24h')
  const giveawayItem = interaction.options.get('item', true).value?.toString() ?? 'nothing'
  const timestap = Math.floor((new Date().getTime() + giveawayTime) / 1000)
  const giveawayMessage = await interaction.reply({
    ephemeral: false,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Teilnehmen")
          .setEmoji('🎉')
          .setCustomId('giveaway-participate')
          .setStyle(ButtonStyle.Primary)
      )
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle('Neues Giveaway')
        .addFields(
          { name: 'Gewinn:', value: giveawayItem },
          { name: 'Endet:', value: `<t:${timestap}:R> <t:${timestap}:d> <t:${timestap}:T>` },
          { name: 'Teilnehmer:', value: '0' }
        )
        .setFooter({ iconURL: client.user?.avatarURL() ?? undefined, text: 'FloBot' })
        .setTimestamp(timestap)
    ],
    fetchReply: true
  })
  const channelId = interaction.channelId
  await db.runAsync(`INSERT INTO giveaways(message_id, organizer_id, prize, status, timestamp, channel_id, author_display_name, author_avatar_url) VALUES(?,?,?,?,?,?,?,?)`, [
    giveawayMessage.id,
    interaction.member?.user.id ?? '<ERROR>',
    giveawayItem,
    GIVEAWAY_STATUS.OPENED,
    timestap * 1000,
    channelId,
    giveawayBy.displayName,
    giveawayBy.avatarURL()
  ])
}

export async function newParticipant (client: Client, interaction: ButtonInteraction, db: AsyncDatabase): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const dc_id = interaction.user.id
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ga_id = interaction.message.id
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const giveaway_obj = await db.getAsync(`SELECT message_id, timestamp, status, prize FROM giveaways WHERE message_id = ?`, [ga_id])
  if (!giveaway_obj || giveaway_obj.status !== GIVEAWAY_STATUS.OPENED) {
    await interaction.reply({ content: 'Schlechter Versuch. Das gibt ein Timeout.' })
    if (interaction.inGuild()) {
      await (await interaction.guild?.members.fetch(interaction.user.id))?.timeout(ms('24h'), 'Hat versucht Giveaway zu hacken. (vllt, maybe, kann sein)')
    }
    return
  }
  if (!giveaway_obj.timestamp || giveaway_obj.timestamp < new Date().getTime()) {
    await interaction.reply({ content: 'Du bist zu spät.', ephemeral: true })
    return
  }
  const channel = interaction.channel as TextChannel
  const message = await channel?.messages.fetch(ga_id)
  if (!message) {
    await interaction.reply({ content: 'ERROR. Giveaway gibt es nicht', ephemeral: true })
    return
  }
  const teilnehmer = await db.allAsync(`SELECT count(*) as count FROM giveaway_participants WHERE giveaway_message_id = ?`, [ga_id])
  const numberOfParticipants = teilnehmer[0]?.count as number
  await message.edit({
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Teilnehmen")
          .setEmoji('🎉')
          .setCustomId('giveaway-participate')
          .setStyle(ButtonStyle.Primary)
      )
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle('Neues Giveaway')
        .addFields(
          { name: 'Gewinn:', value: giveaway_obj.prize },
          { name: 'Endet:', value: `<t:${Math.floor(new Date().getTime() / 1000)}:t>` },
          { name: 'Teilnehmer:', value: `${numberOfParticipants + 1}` }
        )
        .setFooter({ iconURL: client.user?.avatarURL() ?? undefined, text: 'FloBot' })
        .setTimestamp(Math.floor(giveaway_obj.timestamp / 1000))
    ]
  })
  const hash = dc_id + ga_id /* Sollte mal ein Hash sein, ist aber keiner (nicht wundern) */
  await db.runAsync(`INSERT INTO giveaway_participants(dc_id, giveaway_message_id, hash) VALUES(?,?,?)`, [dc_id, ga_id, hash])
  await interaction.reply({ content: 'Du nimmst beim Giveaway teil', ephemeral: true })
}

export async function evalGiveaway (client: Client, interaction: CommandInteraction, db: AsyncDatabase): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const dc_id = interaction.user.id
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ga_id = interaction.options.get('messageid', true).value?.toString() ?? 'ERROR'
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const giveaway_obj = await db.getAsync(`SELECT message_id, prize, timestamp, status, organizer_id FROM giveaways WHERE message_id = ? AND organizer_id = ?`, [ga_id, dc_id])
  if (!giveaway_obj || giveaway_obj.status !== GIVEAWAY_STATUS.OPENED) {
    await interaction.reply({ content: 'ERROR. Dir fehlt die Berechtigung oder das Giveaway existiert nicht. Wer weiß?', ephemeral: true })
    return
  }
  const channel = interaction.channel as TextChannel
  const message = await channel?.messages.fetch(ga_id)
  if (!message) {
    await interaction.reply({ content: 'ERROR. Giveaway gibt es nicht', ephemeral: true })
    return
  }
  const teilnehmer = await db.allAsync(`SELECT giveaway_message_id, dc_id FROM giveaway_participants WHERE giveaway_message_id = ?`, [ga_id])
  let winner = 'niemand'
  if (teilnehmer.length > 0) winner = teilnehmer[randomInt(teilnehmer.length)]?.dc_id as string
  await db.runAsync(`UPDATE giveaways SET status = ? WHERE message_id = ? AND organizer_id = ?`, [GIVEAWAY_STATUS.CLOSED, ga_id, dc_id])
  await db.runAsync(`DELETE FROM giveaways WHERE message_id = ? AND organizer_id = ? AND status = ?`, [ga_id, dc_id, GIVEAWAY_STATUS.CLOSED])
  await db.runAsync(`DELETE FROM giveaway_participants WHERE giveaway_message_id = ?`, [ga_id])
  await message.edit({
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Teilnehmen")
          .setEmoji('🎉')
          .setCustomId('giveaway-participate')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      )
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle('Altes Giveaway')
        .addFields(
          { name: 'Gewinn:', value: giveaway_obj.prize },
          { name: 'Endete:', value: `<t:${Math.floor(new Date().getTime() / 1000)}:t>` },
          { name: 'Gewinner:', value: `<@${winner}>` },
          { name: 'Teilnehmeranzahl:', value: `${teilnehmer.length}` }
        )
        .setFooter({ iconURL: client.user?.avatarURL() ?? undefined, text: 'FloBot' })
        .setTimestamp(Math.floor(giveaway_obj.timestamp / 1000))
    ]
  })
  await interaction.reply(
    {
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle('Giveaway wurde beendet')
      ],
      ephemeral: true
    })
}

export async function evalGiveawayBackground (client: Client, db: AsyncDatabase, log: LogManager): Promise<void> {
  const giveawayArr = await db.allAsync(`SELECT message_id, prize, timestamp, status, organizer_id, channel_id FROM giveaways WHERE status = 0 and channel_id is not null`, [])
  for (const giveawayObj of giveawayArr) {
    const timestamp = giveawayObj.timestamp
    if (timestamp < new Date().getTime()) {
      await log.logger('giveaway-background').log('DEBUG', `Found due giveaway ${giveawayObj.message_id as string}`)
      const allTeilnehmerArr = await db.allAsync(`SELECT giveaway_message_id, dc_id FROM giveaway_participants WHERE giveaway_message_id = ?`, [giveawayObj.message_id])
      const winner = allTeilnehmerArr.length > 0 ? allTeilnehmerArr[randomInt(allTeilnehmerArr.length)]?.dc_id as string : 'niemand'
      await log.logger('giveaway-background').log('DEBUG', `giveaway ${giveawayObj.message_id as string} has winner ${winner}`)
      await db.runAsync(`UPDATE giveaways SET status = ? WHERE message_id = ? AND organizer_id = ?`, [GIVEAWAY_STATUS.CLOSED, giveawayObj.message_id, giveawayObj.organizer_id])
      await db.runAsync(`DELETE FROM giveaways WHERE message_id = ? AND organizer_id = ? AND status = ?`, [giveawayObj.message_id, giveawayObj.organizer_id, GIVEAWAY_STATUS.CLOSED])
      await db.runAsync(`DELETE FROM giveaway_participants WHERE giveaway_message_id = ?`, [giveawayObj.message_id])
      const channel = await client.channels.fetch(giveawayObj.channel_id) as TextChannel
      const message = await channel.messages.fetch(giveawayObj.message_id)
      if (message) {
        await message.edit({
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Teilnehmen")
                .setEmoji('🎉')
                .setCustomId('giveaway-participate')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            )
          ],
          embeds: [
            new EmbedBuilder()
              .setTitle('Altes Giveaway')
              .addFields(
                { name: 'Gewinn:', value: giveawayObj.prize },
                { name: 'Endete:', value: `<t:${Math.floor(new Date().getTime() / 1000)}:t>` },
                { name: 'Gewinner:', value: `<@${winner}>` },
                { name: 'Teilnehmeranzahl:', value: `${allTeilnehmerArr.length}` }
              )
              .setFooter({ iconURL: client.user?.avatarURL() ?? undefined, text: 'FloBot' })
              .setTimestamp(Math.floor(giveawayObj.timestamp / 1000))
          ]
        })
      }
    }
  }
}
