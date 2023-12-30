import { PersistentDataStorage } from '../persistentDataStorage'
import { getPlayer } from '../remote-api'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'

export const getScoreSubCommand = (): ((
  subcommandGroup: SlashCommandSubcommandBuilder
) => SlashCommandSubcommandBuilder) => {
  return (subcommand) => subcommand.setName('score').setDescription('Get the score for a player')
}

export const handleScore = async (userTag: string): Promise<string> => {
  try {
    const persistentDataStorage = await PersistentDataStorage.instance()
    const storeElement = await persistentDataStorage.load(userTag)
    const data = await getPlayer(storeElement.playerId ?? 0)
    return `You have ${data.cash} points`
  } catch (err) {
    return 'You have no running game. Start one via `/bj play 100`'
  }
}
