import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ChannelType, Client, GuildMember } from 'discord.js'
import LogManager, { ILogger } from '../logger/logger'
import schedule from 'node-schedule'
import { EliteGameDataStorage } from '../service/eliteGameDataStorage'
import promotionService, { getTodayAsDate } from '../service/promotionService'

const LEET_GENERAL_ROLE_ID = process.env.LEET_GENERAL_ROLE_ID ?? '<ERROR>'
const LEET_COMMANDER_ROLE_ID = process.env.LEET_COMMANDER_ROLE_ID ?? '<ERROR>'
const LEET_SERGEANT_ROLE_ID = process.env.LEET_SERGEANT_ROLE_ID ?? '<ERROR>'
const GUILD_ID = process.env.GUILD_ID ?? '<ERROR>'

async function removeRole(member: GuildMember, role: string): Promise<void> {
  if (member.roles.cache.has(role)) {
    await member.roles.remove(role)
  }
}

async function handleGeneralPromotion(general: string, oldGeneral: string | null, lastWinner: string | null, targetChannel: any, client: Client): Promise<void> {
  await targetChannel.send(`<@${general}>${general === lastWinner ? ' won and' : ''} has been promoted to Leet General!`)
  const member = await client.guilds.cache.get(GUILD_ID)?.members.fetch(general)
  if (member) {
    await removeRole(member, LEET_COMMANDER_ROLE_ID)
    await removeRole(member, LEET_SERGEANT_ROLE_ID)
    await member.roles.add(LEET_GENERAL_ROLE_ID)
  }
  if (oldGeneral) {
    const memberToRemove = await client.guilds.cache.get(GUILD_ID)?.members.fetch(oldGeneral)
    if (memberToRemove) {
      await removeRole(memberToRemove, LEET_GENERAL_ROLE_ID)
    }
  }
}

async function handleCommanderPromotion(commander: string, oldCommander: string | null, lastWinner: string | null, targetChannel: any, client: Client): Promise<void> {
  await targetChannel.send(`<@${commander}>${commander === lastWinner ? ' won and' : ''} has been promoted to Leet Commander!`)
  const member = await client.guilds.cache.get(GUILD_ID)?.members.fetch(commander)
  if (member) {
    await removeRole(member, LEET_SERGEANT_ROLE_ID)
    await member.roles.add(LEET_COMMANDER_ROLE_ID)
  }
  if (oldCommander) {
    const memberToRemove = await client.guilds.cache.get(GUILD_ID)?.members.fetch(oldCommander)
    if (memberToRemove) {
      await removeRole(memberToRemove, LEET_COMMANDER_ROLE_ID)
    }
  }
}

async function handleSergeantPromotion(sergeantAndWinner: string, oldSergent: string | null, targetChannel: any, client: Client): Promise<void> {
  await targetChannel.send(`<@${sergeantAndWinner}> won and has been promoted to Leet Sergeant!`)
  const member = await client.guilds.cache.get(GUILD_ID)?.members.fetch(sergeantAndWinner)
  await member?.roles.add(LEET_SERGEANT_ROLE_ID)
  if (oldSergent) {
    const memberToRemove = await client.guilds.cache.get(GUILD_ID)?.members.fetch(oldSergent)
    if (memberToRemove) {
      await removeRole(memberToRemove, LEET_SERGEANT_ROLE_ID)
    }
  }
}

async function doPromotions(targetChannel: any, client: Client): Promise<void> {
  const { general: oldGeneral, commander: oldCommander, sergeant: oldSergent } = await promotionService.getCurrentRanks()
  const { general, commander, sergeant, lastWinner } = await promotionService.doPromotions()
  if (general) {
    await handleGeneralPromotion(general, oldGeneral, lastWinner, targetChannel, client)
  }
  if (commander) {
    await handleCommanderPromotion(commander, oldCommander, lastWinner, targetChannel, client)
  }
  if (sergeant) {
    await handleSergeantPromotion(sergeant, oldSergent, targetChannel, client)
  }
  if (lastWinner && lastWinner !== general && lastWinner !== commander && lastWinner !== sergeant) {
    await targetChannel.send(`<@${lastWinner}> won!`)
  }
}

export default {
  init: (client: Client, logger: ILogger): void => {
    client.on('ready', async () => {
      if (!client.user || !client.application) {
        return
      }
      logger.logSync('INFO', `Init EliteCommand`)

      // Everyday at 13:37 (24 hour clock) Europe/
      schedule.scheduleJob({ rule: '37 13 * * *', tz: 'Europe/Berlin' }, async () => {
        const targetChannel = await client.channels.fetch(process.env.SEND_1337_CHANNEL_ID ?? '<ERROR>')
        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
          logger.logSync('WARN', 'MessageLogger could not find log channel or LogChannel is not TextBased')
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setTimeout(async () => {
          const berlinDate = getTodayAsDate()
          // write '\uFFFF' to player column to indicate that the game has been played for this day
          await EliteGameDataStorage.instance().writeGamePlay('\uFFFF', berlinDate)
          // find all participants and sort them by play_timestamp (first one is the winner)
          const rows = await EliteGameDataStorage.instance().loadGamePlayAll(berlinDate)
          await targetChannel.send('13:37')
          if (rows && rows.length > 0) {
            const topRow = rows[0]
            await EliteGameDataStorage.instance().writeGameWinner(topRow.player, berlinDate, topRow.play_timestamp)
            await doPromotions(targetChannel, client)
          }
        }, Math.random() * 60000) // delay by 0-60 seconds
      })
    })
  },
  data: new SlashCommandBuilder().setName('1337').setDescription('Plays the 1337 game.'),
  async execute(interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger('EliteCommand')
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }
    const berlinDate = getTodayAsDate()

    const userId = interaction.member?.user.id ?? '<ERROR>'

    const rows = await EliteGameDataStorage.instance().loadGamePlayForUser(userId, berlinDate)
    try {
      if (rows.length > 0) {
        if (rows[0].player === '\uFFFF') {
          // the player '\uFFFF' indicates that the game has been played for this day
          await interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle('Too late!')
              .setDescription(
                'Es ist nach 13:37. Morgen kannst du wieder mitmachen.'
              )
              .setTimestamp()],
            ephemeral: true
          })
        } else {
          await interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle('That`s not going to happen!')
              .setDescription(
                'Du hast heute bereits deinen Tipp abgegeben. Warte auf das Ergebnis.'
              )
              .setTimestamp()],
            ephemeral: true
          })
        }
      } else {
        await EliteGameDataStorage.instance().writeGamePlay(userId, berlinDate)
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Got it!')
            .setDescription(
              'Dein Tipp wurde registriert. Warte auf das Ergebnis.'
            )
            .setTimestamp()],
          ephemeral: true
        })
      }
    } catch (err) {
      console.log(err)
      logger.logSync('ERROR', `Reply to elite command konnte nicht gesendet werden. ${JSON.stringify(err)}`)
    }
  }
}
