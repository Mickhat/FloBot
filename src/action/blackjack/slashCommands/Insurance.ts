import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { PersistentDataStorage } from '../persistentDataStorage'
import { getPlayer, postInsurance } from '../remote-api'
import { evalResult } from '../handleCommands'

export const getInsuranceSubCommand = (): ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder) => {
  return subcommand =>
    subcommand
      .setName('insurance')
      .setDescription('do and do not buy an insurance')
      .addStringOption(option =>
        option.setName('buy')
          .setDescription('yes or no')
          .setRequired(true))
}

export const handleInsurance = async (userTag: string, insuranceBuy: string): Promise<string> => {
  const persistentDataStorage = await PersistentDataStorage.instance()
  const storeElement = await persistentDataStorage.load(userTag)
  if (!storeElement.betId) {
    return 'No game active. Use `/bj play` to start a game or check your score with `/bj score`'
  }
  if (!(JSON.parse(storeElement.followActions) as string[]).includes('insurance')) {
    return `You cannot hit. Allowed actions are ${storeElement.followActions}`
  }
  const data = await postInsurance(storeElement, insuranceBuy)
  const { followActions } = data
  if (followActions.length === 0) {
    const playerResponse = await getPlayer(storeElement.playerId ?? 0)
    await persistentDataStorage.cleanup(storeElement.userTag, playerResponse.cash)
    return await evalResult(storeElement)
  } else {
    storeElement.followActions = JSON.stringify(data.followActions)
    await (await PersistentDataStorage.instance()).save(storeElement)
    return `Your options are ${followActions.join(', ')}.`
  }
}
