import { getHighscore } from '../remote-api'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'

export const getHighscoreSubCommand = (): ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder) => {
  return subcommand =>
    subcommand
      .setName('highscore')
      .setDescription('get the highscore')
}

export const handleHighscore = async (): Promise<string> => {
  const data = await getHighscore()
  return 'Highscore:\r\n' + data.map(e => `${e.pos}. : ${e.name} with ${e.money} points`).join('\r\n') + '\r\nThis seems a bit high? Play this game by writing code! See https://bj.oglimmer.de/swagger/ui'
}
