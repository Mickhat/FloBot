import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { PersistentDataStorage } from '../persistentDataStorage'
import { getPlayer, postSplit } from '../remote-api'
import { evalResult } from '../handleCommands'

export const getSplitSubCommand = (): ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder) => {
  return subcommand =>
    subcommand
      .setName('split')
      .setDescription('split')
}

export const handleSplit = async (userTag: string): Promise<string> => {
  const persistentDataStorage = await PersistentDataStorage.instance()
  const storeElement = await persistentDataStorage.load(userTag)
  if (!storeElement.betId) {
    return 'No game active. Use `/bj play` to start a game or check your score with `/bj score`'
  }
  if (!(JSON.parse(storeElement.followActions) as string[]).includes('split')) {
    return `You cannot hit. Allowed actions are ${storeElement.followActions}`
  }
  const betData = await postSplit(storeElement)
  const { firstBetCard1, firstBetCard2, firstBetTotal, secondBetCard1, secondBetCard2, secondBetTotal, followActions, secondBetFollowAction } = betData
  if (followActions.length === 0) {
    if (secondBetFollowAction.length === 0) {
      const playerResponse = await getPlayer(storeElement.playerId ?? 0)
      await persistentDataStorage.cleanup(storeElement.userTag, playerResponse.cash)
      return `Both hands are completed. ${await evalResult(storeElement)}`
    } else {
      storeElement.followActions = JSON.stringify(betData.secondBetFollowAction)
      storeElement.betId = betData.secondBetId
      await persistentDataStorage.save(storeElement)
      return `Your first hand is ${firstBetCard1} and ${firstBetCard2}, with a total of ${firstBetTotal}. Your second hand is ${secondBetCard1} and ${secondBetCard2}, with a total of ${secondBetTotal}. No actions available for first hand. The second had can do ${secondBetFollowAction.join(', ')}.`
    }
  } else {
    storeElement.secondBetId = betData.secondBetId
    storeElement.followActions = JSON.stringify(betData.followActions)
    storeElement.secondBetFollowActions = JSON.stringify(betData.secondBetFollowAction)
    await persistentDataStorage.save(storeElement)
    return `Your first hand is ${firstBetCard1} and ${firstBetCard2}, with a total of ${firstBetTotal}. Your second hand is ${secondBetCard1} and ${secondBetCard2}, with a total of ${secondBetTotal}. You will play the first hand next, your options for the first hand are ${followActions.join(', ')}.`
  }
}
