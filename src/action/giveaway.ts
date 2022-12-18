import { randomInt } from "crypto"
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, Colors, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js"
import ms from "ms"
import { AsyncDatabase } from "src/sqlite/sqlite"

type giveawayStatus = 0 | 1
const GIVEAWAY_STATUS: { OPENED: giveawayStatus, CLOSED: giveawayStatus } = { OPENED: 0, CLOSED: 1 }

export async function createGiveaway (client: Client, interaction: CommandInteraction, db: AsyncDatabase): Promise<void> {
  const giveawayBy = interaction.member as GuildMember
  const giveawayTime = ms(interaction.options.get('time', false)?.value?.toString() ?? '24h') || ms('24h')
  const giveawayItem = interaction.options.get('item', true).value?.toString() ?? 'nothing'
  const timestap = Math.floor((new Date().getTime() + giveawayTime) / 1000)
  const giveawayMessage = await interaction.reply({
    content: 'Giveaway Vorschau. Das System ist nicht aktiv.',
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
        .setAuthor({ name: giveawayBy.displayName, iconURL: giveawayBy.avatarURL() ?? undefined })
        .setTitle('Neues Giveaway')
        .addFields(
          { name: 'Gewinn:', value: giveawayItem },
          { name: 'Endet:', value: `<t:${timestap}:R> <t:${timestap}:d> <t:${timestap}:T>` }
        )
        .setFooter({ iconURL: client.user?.avatarURL() ?? undefined, text: 'FloBot' })
        .setTimestamp(timestap)
    ],
    fetchReply: true
  })
  await db.runAsync(`INSERT INTO giveaways(message_id, organizer_id, prize, status, timestamp) VALUES(?,?,?,?,?)`, [
    giveawayMessage.id,
    interaction.member?.user.id ?? '<ERROR>',
    giveawayItem,
    GIVEAWAY_STATUS.OPENED,
    timestap * 1000
  ])
}

export async function newParticipant (client: Client, interaction: ButtonInteraction, db: AsyncDatabase): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const dc_id = interaction.user.id
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ga_id = interaction.message.id
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const giveaway_obj = await db.getAsync(`SELECT message_id, timestamp, status FROM giveaways WHERE message_id = ?`, [ga_id])
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
  const message = await interaction.channel?.messages.fetch(ga_id)
  if (!message) {
    await interaction.reply({ content: 'ERROR. Giveaway gibt es nicht', ephemeral: true })
    return
  }
  const teilnehmer = await db.allAsync(`SELECT giveaway_message_id, dc_id FROM giveaway_participants WHERE giveaway_message_id = ?`, [ga_id])
  let winner = 'niemand'
  if (teilnehmer.length > 0) winner = teilnehmer[randomInt(teilnehmer.length)]?.dc_id
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
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? undefined })
        .setTitle('Altes Giveaway')
        .addFields(
          { name: 'Gewinn:', value: giveaway_obj.prize },
          { name: 'Endete:', value: `<t:${Math.floor(new Date().getTime() / 1000)}:t>` },
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
