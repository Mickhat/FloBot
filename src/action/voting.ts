import { Client, CommandInteraction, escapeMarkdown } from 'discord.js'

export default async (client: Client, interaction: CommandInteraction): Promise<void> => {
  const question = escapeMarkdown(interaction.options.get('question', true).value?.toString() ?? '')
  const answers = escapeMarkdown(interaction.options.get('answers', true).value?.toString() ?? '').split(',')

  const emojis = [
    '🟥', '🟨', '🟦', '🟩', '🟪', '⬛'
  ]

  if (question === '' || answers.length < 2) {
    await interaction.reply({
      content: 'Die Parameter wurden falsch ausgefüllt.',
      ephemeral: true
    })
    return
  }
  if (answers.length > 6) {
    await interaction.reply({
      content: 'Die maximale Anzahl an Antwortmöglichkeiten ist 6',
      ephemeral: true
    })
    return
  }

  const messageString = `**${interaction.member?.user.username as string}** _fragt_: ${question}

${answers.map((value, index) => `${emojis[index]} ${value}`).join('\n')}
`

  const message = await interaction.reply({
    content: messageString,
    fetchReply: true
  })

  for (const i of answers) {
    await message.react(i)
  }
}
