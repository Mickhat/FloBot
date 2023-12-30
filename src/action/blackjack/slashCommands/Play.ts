import { getPlayer, postBet, postDeck, postGame, postPlayer } from '../remote-api'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { IGameData, PersistentDataStorage } from '../persistentDataStorage'
import { AxiosError } from 'axios'
import { evalResult } from '../handleCommands'

export const getPlaySubCommand = (): ((
  subcommandGroup: SlashCommandSubcommandBuilder
) => SlashCommandSubcommandBuilder) => {
  return (subcommand) =>
    subcommand
      .setName('play')
      .setDescription('Create a game and place your bet')
      .addIntegerOption((option) =>
        option.setName('bet').setDescription('The amount to bet ($1 to $1000)').setRequired(true)
      )
}

const ensurePlayerExists = async (storeElement: IGameData, userTag: string): Promise<void> => {
  if (!storeElement.playerId || (await getPlayer(storeElement.playerId)).cash === 0) {
    const data = await postPlayer(userTag)
    storeElement.playerId = data.playerId
    const persistentDataStorage = await PersistentDataStorage.instance()
    await persistentDataStorage.save(storeElement)
  }
}

const ensureDeckExists = async (storeElement: IGameData): Promise<void> => {
  if (!storeElement.deckId) {
    const data = await postDeck()
    storeElement.deckId = data.deckId
    const persistentDataStorage = await PersistentDataStorage.instance()
    await persistentDataStorage.save(storeElement)
  }
}

export const handlePlay = async (userTag: string, betValue: number): Promise<string> => {
  const persistentDataStorage = await PersistentDataStorage.instance()
  const gameData = await persistentDataStorage.load(userTag)
  await ensureDeckExists(gameData)
  await ensurePlayerExists(gameData, gameData.userTag)
  try {
    const gameDataResponse = await postGame(gameData)
    gameData.gameId = gameDataResponse.gameId
    const betData = await postBet(gameData, betValue)
    gameData.betId = betData.betId
    gameData.followActions = JSON.stringify(betData.followActions)
    await persistentDataStorage.save(gameData)
    const { card1, card2, dealersCard, yourTotal, followActions } = betData
    if (followActions.length === 0) {
      const player = await getPlayer(gameData.playerId ?? 0)
      await persistentDataStorage.cleanup(gameData.userTag, player.cash)
      return (
        `A game has started and your bet has been placed. Your cards: ${card1} and ${card2}. The dealer's open card ${dealersCard}. Your total is ${yourTotal}. ` +
        (await evalResult(gameData))
      )
    } else {
      return `A game has started and your bet has been placed. Your cards: ${card1} and ${card2}. The dealer's open card ${dealersCard}. Your total is ${yourTotal}. Your options are ${followActions.join(
        ', '
      )}.`
    }
  } catch (err: Error | AxiosError | any) {
    if (err instanceof AxiosError) {
      return `Play failed. ${JSON.stringify(err.response?.data)}. Use \`/bj score\` to see your score.`
    } else {
      return `Play failed. ${JSON.stringify(err)}`
    }
  }
}
