
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import LogManager from '../logger/logger'
import { EliteGameDataStorage } from '../service/eliteGameDataStorage'
import { getTodayAsDate } from '../service/promotionService'
import { calcValidFrom, parse } from '../service/eliteEarlyBirdService'

export default {
  data: new SlashCommandBuilder()
    .setName('1337-early-bird')
    .setDescription('Plays the 1337 game as an early bird.')
    .addStringOption((opt) => opt.setName('time').setDescription('The time (HH:mm:ss.sss) you would have /1337`ed').setRequired(true)),
  async execute(interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger('EliteEarlyBirdCommand')
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }
    const berlinDate = getTodayAsDate()

    const userId = interaction.member?.user.id ?? '<ERROR>'
    const time = interaction.options.get('time', true).value
    if (!time) {
      throw new Error('No time provided')
    }

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
        const playTime = parse(time)
        if (!playTime) {
          await interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle('Invalid time!')
              .setDescription(
                'Die Zeit muss im Format `HH:mm:ss.sss` sein.'
              )
              .setTimestamp()],
            ephemeral: true
          })
          return
        }
        const validFrom = calcValidFrom(playTime)
        await EliteGameDataStorage.instance().writeGamePlayEarlyBird(
          userId, // discord-id user
          berlinDate, // german format date of play e.g. 17.06.2024
          playTime, // submission time (the guess) in millis since epoc e.g. 1710419768333 for 13.03.2024 23:05
          validFrom // valid starting time in millis since epoc e.g. 1710419768333 for 13.03.2024 23:05
        )
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Got it early bird!')
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
