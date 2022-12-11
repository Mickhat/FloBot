import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { PersistentDataStorage } from '../persistentDataStorage'
import { getPlayer, postDouble } from '../remote-api'
import { evalResult } from '../handleCommands'

export const getDoubleSubCommand = (): ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder) => {
  return subcommand =>
    subcommand
      .setName('double')
      .setDescription('double')
}

export const handleDouble = async (userTag: string): Promise<string> => {
  const persistentDataStorage = await PersistentDataStorage.instance()
  const storeElement = await persistentDataStorage.load(userTag)
  if (!storeElement.betId) {
    return 'No game active. Use `/bj play` to start a game or check your score with `/bj score`'
  }
  if (!(JSON.parse(storeElement.followActions) as string[]).includes('double')) {
    return `You cannot hit. Allowed actions are ${storeElement.followActions}`
  }
  const data = await postDouble(storeElement)
  const { drawnCard, yourTotal } = data
  const playerResponse = await getPlayer(storeElement.playerId ?? 0)
  await persistentDataStorage.cleanup(storeElement.userTag, playerResponse.cash)
  return `You have drawn ${drawnCard}, which brings your total to ${yourTotal}. ` + await evalResult(storeElement)
}
