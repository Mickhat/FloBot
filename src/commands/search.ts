import { Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import LogManager from "src/logger/logger"

export default {
  data: new SlashCommandBuilder().setName('search')
    .setDescription('Internet-Suche')
    .addStringOption(option => option.setName('query')
      .setDescription('Was soll gesucht werden?')
      .setRequired(true))
    .addStringOption(o => o
      .setName('engine')
      .addChoices({ name: 'searxng', value: 'x' }, { name: 'google', value: 'g' }, { name: 'duckduckgo', value: 'ddg' })
      .setDescription('Welche Suchmaschine soll verwendet werden?')
      .setRequired(false)
    ),
  async execute (interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger("SearchCommand")
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }

    const query = interaction.options.get('query', true).value?.toString() ?? ''
    const encodedQuery = encodeURIComponent(query)
    let engine
    switch (interaction.options.get('engine', false)?.value?.toString()) {
      case 'g':
        engine = `[_${query}_ auf google suchen](https://lmrgtfy.davwheat.dev/?q=${encodedQuery}&se=google)`
        break
      case 'ddg':
        engine = `[_${query}_ auf duckduckgo suchen](https://lmrgtfy.davwheat.dev/?q=${encodedQuery}&se=ddg)`
        break
      case 'x':
      default:
        engine = `[_${query}_ auf searxng über mickhat suchen](https://search.mickhat.xyz/search?q=${encodedQuery})`
        break
    }

    try {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('Let me search that for you')
          .setDescription(engine)
          .setColor(Colors.Blue)
        ]
      })
    } catch (err) {
      logger.logSync('ERROR', `Suche konnte nicht gesendet werden. ${JSON.stringify(err)}`)
    }
  }
}
