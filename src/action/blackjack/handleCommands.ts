import { IGameData, PersistentDataStorage } from './persistentDataStorage'
import { getBet } from './remote-api'
import {
  CommandInteraction,
  CommandInteractionOptionResolver
} from 'discord.js'
import { handleHighscore } from './slashCommands/Highscore'
import { handlePlay } from './slashCommands/Play'
import { handleScore } from './slashCommands/Score'
import { handleHit } from './slashCommands/Hit'
import { handleStand } from './slashCommands/Stand'
import { handleDouble } from './slashCommands/Double'
import { handleSplit } from './slashCommands/Split'
import { handleInsurance } from './slashCommands/Insurance'
import { handleHelp } from './slashCommands/Help'
import LogManager from '../../logger/logger'

export const handleBlackJackCommands = async (interaction: CommandInteraction, logger: LogManager): Promise<void> => {
  let content = ''
  try {
    const options = interaction.options as CommandInteractionOptionResolver
    const subcommand = options.getSubcommand(true)

    await logger.logger('BlackJack').log('DEBUG', `Received BJ subcommand = ${subcommand} from user ${interaction.user.tag}`)

    if (subcommand === 'highscore') {
      content = await handleHighscore()
    } else if (subcommand === 'help') {
      content = await handleHelp()
    } else if (subcommand === 'play') {
      content = await handlePlay(interaction.user.tag, options.getInteger('bet', true))
    } else if (subcommand === 'score') {
      content = await handleScore(interaction.user.tag)
    } else if (subcommand === 'hit') {
      content = await handleHit(interaction.user.tag)
    } else if (subcommand === 'stand') {
      content = await handleStand(interaction.user.tag)
    } else if (subcommand === 'double') {
      content = await handleDouble(interaction.user.tag)
    } else if (subcommand === 'split') {
      content = await handleSplit(interaction.user.tag)
    } else if (subcommand === 'insurance') {
      content = await handleInsurance(interaction.user.tag, options.getString('buy', true))
    }
  } catch (error: Error | any) {
    await logger.logger('BlackJack').log('DEBUG', `Error : ${JSON.stringify(error)}`)
    let errorText: string
    if (error.response) {
      errorText = error.response.body
    } else {
      errorText = JSON.stringify(error)
    }
    content = `Error: ${errorText}`
  }
  await interaction.reply({
    content,
    ephemeral: true
  })
}

export const evalResult = async (storeElement: IGameData): Promise<string> => {
  const {
    dealersSecondCard,
    dealersAdditionalCard,
    result,
    payout,
    dealerTotal
  } = await getBet(storeElement)
  if (storeElement.secondBetId) {
    storeElement.betId = storeElement.secondBetId
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    storeElement.followActions = storeElement.secondBetFollowActions!
    storeElement.secondBetId = undefined
    storeElement.secondBetFollowActions = undefined
    const persistentDataStorage = await PersistentDataStorage.instance()
    await persistentDataStorage.save(storeElement)
    return `You have 2nd hand. Your options are ${storeElement.followActions}.`
  } else {
    return `Game over. ${result} The dealer's total is ${dealerTotal}. The 2nd card was ${dealersSecondCard}, the dealer has also drawn ${dealersAdditionalCard}. Your payout is \\$${payout} points.`
  }
}
