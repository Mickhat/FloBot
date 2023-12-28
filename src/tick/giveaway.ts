import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, TextChannel } from "discord.js"
import { randomInt } from "node:crypto"
import LogManager from "../logger/logger"
import { AsyncDatabase } from "../sqlite/sqlite"

type giveawayStatus = 0 | 1
const GIVEAWAY_STATUS: { OPENED: giveawayStatus, CLOSED: giveawayStatus } = { OPENED: 0, CLOSED: 1 }

export default async function (client: Client): Promise<void> {
  const logger = LogManager.getInstance().logger('GiveawayTick')
  const db = await AsyncDatabase.open()
  if (!db) {
    await logger.log('ERROR', 'Could not open database')
    return
  }
  const giveawayArr = await db.allAsync(`SELECT message_id, prize, timestamp, status, organizer_id, channel_id FROM giveaways WHERE status = 0 and channel_id is not null`, [])
  for (const giveawayObj of giveawayArr) {
    const timestamp = giveawayObj.timestamp
    if (timestamp < new Date().getTime()) {
      await logger.log('DEBUG', `Found due giveaway ${giveawayObj.message_id as string}`)
      const allTeilnehmerArr = await db.allAsync(`SELECT giveaway_message_id, dc_id FROM giveaway_participants WHERE giveaway_message_id = ?`, [giveawayObj.message_id])
      const winner = allTeilnehmerArr.length > 0 ? allTeilnehmerArr[randomInt(allTeilnehmerArr.length)]?.dc_id as string : 'niemand'
      await logger.log('DEBUG', `giveaway ${giveawayObj.message_id as string} has winner ${winner}`)
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
              .setFooter({ iconURL: client.user?.avatarURL() ?? undefined, text: 'PlaceholderBot' })
              .setTimestamp(Math.floor(giveawayObj.timestamp / 1000))
          ]
        })
      }
    }
  }
}
