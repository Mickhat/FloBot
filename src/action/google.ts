import { Client, CommandInteraction, EmbedBuilder, Colors } from 'discord.js'
import { ILogger } from 'src/logger/logger'

export async function google (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const query = encodeURIComponent(interaction.options.get('query', true).value?.toString() ?? '')

  try {
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('Let me google that for you')

        .setDescription(`https://lmrgtfy.davwheat.dev/?q=${query}`)
        .setColor(Colors.Blue)
      ]
    })
  } catch (err) {
    logger.logSync('ERROR', `Google konnte nicht gesendet werden. ${JSON.stringify(err)}`)
  }
}
