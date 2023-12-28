import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import LogManager from "../logger/logger"

export default {
  data: new SlashCommandBuilder().setName('metafrage')
    .setDescription('Ein Text über Metafragen.'),
  async execute (interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger("MetafrageCommand")
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }

    try {
      await interaction.reply({
        content: `**Metafragen** sind Fragen, welche oft vor einer richtigen Frage gestellt werden.
Klassische Beispiele für Metafragen sind:
- Kann mir jemand mit JavaScript helfen?
- Wer kennt sich mit IP-Adressen aus?
Solche Fragen verhindern eine schnelle Antwort auf die eigentliche Frage. Oft denkt jemand nicht, im Fachgebiet "gut genug" zu sein, kennt aber die Antwort und könnte trotzdem nicht antworten. Auch wenn sich jemand meldet, muss er erst auf die Antwort des Fragestellers warten, bis er antworten kann.
__Stelle deine Frage direkt, ohne erstmal nach einem Experten zu suchen. Dies erspart dir Zeit und erhöht die Chance auf eine Antwort.__
[mehr Informationen](http://metafrage.de/)`
      })
      logger.logSync('INFO', 'Metafragen-Info gesendet.')
    } catch (err) {
      logger.logSync('ERROR', `Metafragen-Info konnte nicht gesendet werden!. Error: ${JSON.stringify(err)}`)
    }
  }
}
