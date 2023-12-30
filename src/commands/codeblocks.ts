import { CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { LogManager } from '../logger/logger'

export default {
  data: new SlashCommandBuilder().setName('codeblocks').setDescription('Ein Text über Codeblocks'),
  async execute(interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger('CodeblockCoFmmand')
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }

    try {
      await interaction.reply({
        content: `**Codeblocks** sind in discord-Nachrichten integrierbare Blöcke, die Quellcode enthalten. Sie sehen so aus:
  \`\`\`py
  print("Hello World")
  \`\`\`
  Du erstellst sie mit drei \\\` vor deinem Code und drei \\\` nach deinem Code. Um das Syntax-Highlighting zu aktivieren, kannst du nach den ersten drei \\\` die Sprache dazuschreiben.
  Der Codeblock von oben sieht so aus:
  \\\`\\\`\\\`py
  print("Hello World")
  \\\`\\\`\\\`
  Dadurch machst du deinen Code, im Vergleich zu normalem Text, besser lesbar für alle und kannst schneller eine Antwort auf deine Frage bekommen. Auch sind sie, im Vergleich zu Screenshots, sehr Datensparsam.
  Codeblocks sind die beste Art, Code auf Discord zu teilen, und alle werden dir Dankbar sein, wenn du sie nutzt.
  `
      })
      logger.logSync('INFO', 'Codeblock-Info gesendet.')
    } catch (err) {
      logger.logSync('ERROR', `Codeblock-Info konnte nicht gesendet werden. Error: ${JSON.stringify(err)}`)
    }
  }
}
