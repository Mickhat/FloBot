import { getHighscoreSubCommand } from './slashCommands/Highscore'
import { getPlaySubCommand } from './slashCommands/Play'
import { getScoreSubCommand } from './slashCommands/Score'
import { getInsuranceSubCommand } from './slashCommands/Insurance'
import { getSplitSubCommand } from './slashCommands/Split'
import { getDoubleSubCommand } from './slashCommands/Double'
import { getStandSubCommand } from './slashCommands/Stand'
import { getHitSubCommand } from './slashCommands/Hit'
import { getHelpSubCommand } from './slashCommands/Help'
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'

export const registerBlackJackCommands = (): SlashCommandSubcommandsOnlyBuilder => {
  return new SlashCommandBuilder()
    .setName('bj')
    .setDescription('Learn the BlackJack rules on Discord to join a CodingGame!')
    .addSubcommand(getHelpSubCommand())
    .addSubcommand(getHighscoreSubCommand())
    .addSubcommand(getScoreSubCommand())
    .addSubcommand(getPlaySubCommand())
    .addSubcommand(getHitSubCommand())
    .addSubcommand(getStandSubCommand())
    .addSubcommand(getDoubleSubCommand())
    .addSubcommand(getSplitSubCommand())
    .addSubcommand(getInsuranceSubCommand())
}
