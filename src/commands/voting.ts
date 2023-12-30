import { CommandInteraction, SlashCommandBuilder, escapeMarkdown } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('voting')
    .setDescription('Eine Umfrage / Abstimmung machen.')
    .addStringOption((option) => option.setName('question').setDescription('Die Frage').setRequired(true))
    .addStringOption((option) =>
      option.setName('answers').setDescription('Die Antworten, mit Kommata getrennt').setRequired(true)
    ),
  async execute(interaction: CommandInteraction): Promise<void> {
    const question = escapeMarkdown(interaction.options.get('question', true).value?.toString() ?? '')
    const answers = escapeMarkdown(interaction.options.get('answers', true).value?.toString() ?? '').split(',')

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

    if (question === '' || answers.length < 2) {
      await interaction.reply({
        content: 'Die Parameter wurden falsch ausgefüllt.',
        ephemeral: true
      })
      return
    }
    if (answers.length > 10) {
      await interaction.reply({
        content: 'Die maximale Anzahl an Antwortmöglichkeiten ist 10',
        ephemeral: true
      })
      return
    }

    const messageString = `_${interaction.member?.user.username as string} fragt:_ ${question}

${answers.map((value, index) => `${emojis[index]} ${value}`).join('\n')}
`

    const message = await interaction.reply({
      content: messageString,
      fetchReply: true
    })

    for (let i = 0; i < answers.length; i++) {
      await message.react(emojis[i])
    }
  }
}
