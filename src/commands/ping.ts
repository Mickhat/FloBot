import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import LogManager from "src/logger/logger"

export default {
  data: new SlashCommandBuilder().setName('ping')
    .setDescription('ping'),
  async execute (interaction: CommandInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger('PingCommand')
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }

    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true })

    try {
      await interaction.editReply({
        content: `PONG!\nCurrent Bot latency: ${interaction.client.ws.ping}ms\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`
      })
      logger.logSync('INFO', 'Pong wurde erfolgreich gesendet.')
    } catch (err) {
      logger.logSync('ERROR', `Ping konnte nicht gesendet werden. Error ${JSON.stringify(err)}`)
    }
  }
}
