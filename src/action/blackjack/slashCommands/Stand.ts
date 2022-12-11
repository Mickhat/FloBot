import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { PersistentDataStorage } from '../persistentDataStorage'
import { getPlayer, postStand } from '../remote-api'
import { evalResult } from '../handleCommands'

export const getStandSubCommand = (): ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder) => {
  return subcommand =>
    subcommand
      .setName('stand')
      .setDescription('stand')
}

export const handleStand = async (userTag: string): Promise<string> => {
  const persistentDataStorage = await PersistentDataStorage.instance()
  const storeElement = await persistentDataStorage.load(userTag)
  if (!storeElement.betId) {
    return 'No game active. Use `/bj play` to start a game or check your score with `/bj score`'
  }
  if (!(JSON.parse(storeElement.followActions) as string[]).includes('stand')) {
    return `You cannot hit. Allowed actions are ${storeElement.followActions}`
  }
  await postStand(storeElement)
  const playerResponse = await getPlayer(storeElement.playerId ?? 0)
  await persistentDataStorage.cleanup(storeElement.userTag, playerResponse.cash)
  return await evalResult(storeElement)
}
