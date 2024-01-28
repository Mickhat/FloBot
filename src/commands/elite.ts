import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ChannelType, Client } from 'discord.js'
import LogManager, { ILogger } from '../logger/logger'
import schedule from 'node-schedule'
import { AsyncDatabase } from '../sqlite/sqlite'

function getTodayAsDate(): string {
  const berlinDate = new Date().toLocaleDateString('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return berlinDate
}

let db: AsyncDatabase | undefined
export default {
  init: (client: Client, logger: ILogger): void => {
    client.on('ready', async () => {
      if (client.user == null || client.application == null) {
        return
      }
      logger.logSync('INFO', `Init EliteCommand`)

      db = await AsyncDatabase.open()
      if (!db) {
        logger.logSync('ERROR', 'Datenbank konnte nicht geöffnet werden.')
        return
      }
      // Everyday at 13:37 (24 hour clock) Europe/
      schedule.scheduleJob({ rule: '37 13 * * *', tz: 'Europe/Berlin' }, async () => {
        const targetChannel = await client.channels.fetch(process.env.SEND_1337_CHANNEL_ID ?? '')
        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
          logger.logSync('WARN', 'MessageLogger could not find log channel or LogChannel is not TextBased')
          return
        }

        setTimeout(() => {
          void (async () => {
            const berlinDate = getTodayAsDate()
            // write '\uFFFF' to player column to indicate that the game has been played for this day
            await db?.runAsync(`INSERT INTO elite_game (register_date, player, play_timestamp) VALUES(?,?,?)`, [berlinDate, '\uFFFF', 0])
            // find all participants and sort them by play_timestamp (first one is the winner)
            let rows = await db?.getAsync(`select * from elite_game where register_date = ? and player != "\uFFFF" order by play_timestamp desc`, [berlinDate])
            await targetChannel.send('13:37')
            if (rows) {
              if (!Array.isArray(rows)) {
                rows = [rows]
              }
              console.log(rows)
              await targetChannel.send(`Todays winner is <@${rows[0].player}>`)
              await db?.runAsync(`INSERT INTO elite_game_winner (player, register_date, play_timestamp, target_timestamp) VALUES(?,?,?,?)`, [rows[0].player, berlinDate, rows[0].play_timestamp, Date.now()])
            }
          })()
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

    let rows = await db?.getAsync(`select * from elite_game where register_date = ? and (player = ? or player = "\uFFFF") order by player desc`, [berlinDate, userId])
    try {
      if (rows) {
        if (!Array.isArray(rows)) {
          rows = [rows]
        }
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
        await db?.runAsync(`INSERT INTO elite_game(register_date, player, play_timestamp) VALUES(?,?,?)`, [berlinDate, userId, Date.now()])
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
      logger.logSync('ERROR', `Reply to elite command konnte nicht gesendet werden. ${JSON.stringify(err)}`)
    }
  }
}
