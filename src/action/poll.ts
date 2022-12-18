import { Client, CommandInteraction, escapeMarkdown } from 'discord.js'

export default async (client: Client, interaction: CommandInteraction): Promise<void> => {
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
