import { CommandInteraction, SlashCommandBuilder, escapeMarkdown } from "discord.js"

export default {
  data: new SlashCommandBuilder().setName('poll')
    .setDescription('Eine Ja-Nein Umfrage / Abstimmung machen. (Nur Ja/Nein Antwort möglich)')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Die Frage')
        .setRequired(true)),
  async execute (interaction: CommandInteraction): Promise<void> {
    const question = escapeMarkdown(interaction.options.get('question', true).value?.toString() ?? '')

    const poll = [
      '👍', '👎'
    ]

    const messageString = `**${interaction.member?.user.username as string}** _fragt_: ${question}
`

    const message = await interaction.reply({
      content: messageString,
      fetchReply: true
    })

    for (let i = 0; i < 2; i++) {
      await message.react(poll[i])
    }
  }
}
