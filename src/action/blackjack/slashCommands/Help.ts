import { SlashCommandSubcommandBuilder } from '@discordjs/builders'

export const getHelpSubCommand = (): ((
  subcommandGroup: SlashCommandSubcommandBuilder
) => SlashCommandSubcommandBuilder) => {
  return (subcommand) => subcommand.setName('help').setDescription('Explains how this command works')
}

export const handleHelp = async (): Promise<string> => {
  return "This is a Coding Game using BlackJack rules.\r\n\r\nYour goal is to get enough points to make it into the highscore (see `/bj highscore`).\r\n\r\nYou can use the discord commands under `/bj...` to learn the rules and then use a programming language of your choice to beat the highscore via the REST API describe at https://bj.oglimmer.de/swagger/ui.\r\n\r\nStart to play via `/bj play 100` - this will start a game by using 100 points.\r\n\r\nOther commands are `/bj score` to check your current score. After you've started a game you can use `/bj hit` or `/bj stand` to hit or stand. Your score will be reset to 1000 points after you reach 0 points or 1 hour of inactivity."
}
