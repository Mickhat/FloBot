import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { PersistentDataStorage } from '../persistentDataStorage'
import { getPlayer, postHit } from '../remote-api'
import { evalResult } from '../handleCommands'

export const getHitSubCommand = (): ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder) => {
  return subcommand =>
    subcommand
      .setName('hit')
      .setDescription('hit')
}

export const handleHit = async (userTag: string): Promise<string> => {
  const persistentDataStorage = await PersistentDataStorage.instance()
  const storeElement = await persistentDataStorage.load(userTag)
  if (!storeElement.betId) {
    return 'No game active. Use `/bj play` to start a game or check your score with `/bj score`'
  }
  if (!(JSON.parse(storeElement.followActions) as string[]).includes('hit')) {
    return `You cannot hit. Allowed actions are ${storeElement.followActions}`
  }
  const data = await postHit(storeElement)
  storeElement.followActions = JSON.stringify(data.followActions)
  await persistentDataStorage.save(storeElement)
  const { drawnCard, yourTotal, followActions } = data
  if (data.followActions.length === 0) {
    const playerResponse = await getPlayer(storeElement.playerId ?? 0)
    await persistentDataStorage.cleanup(storeElement.userTag, playerResponse.cash)
    return `You have drawn ${drawnCard}, which brings your total to ${yourTotal}. ` + await evalResult(storeElement)
  } else {
    return `You have drawn ${drawnCard}, which brings your total to ${yourTotal}. Your options are ${followActions.join(', ')}.`
  }
}
