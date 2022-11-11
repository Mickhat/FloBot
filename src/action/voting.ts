import { Client, CommandInteraction, Emoji, escapeMarkdown, parseEmoji, ReactionEmoji } from 'discord.js'
import { CLIENT_RENEG_WINDOW } from 'node:tls'

export default async (client: Client, interaction: CommandInteraction) => {

    let question = escapeMarkdown(interaction.options.get('question', true).value?.toString() || "")
    let answers = escapeMarkdown(interaction.options.get('answers', true).value?.toString() ?? "").split(',')

    const emojis = [
        '🟥', '🟨', '🟦', '🟩', '🟪', '⬛'
    ]

    if (question == "" || answers.length < 2) {
        interaction.reply({
            content: 'Die Parameter wurden falsch ausgefüllt.',
            ephemeral: true,
        })
        return;
    }
    if (answers.length > 6) {
        interaction.reply({
            content: 'Die maximale Anzahl an Antwortmöglichkeiten ist 6',
            ephemeral: true,
        })
        return;
    }



    let message_string = `**${interaction.member?.user.username}** _fragt_: ${question}

${answers.map((value, index) => `${emojis[index]} ${value}`).join("\n")}
`


    let message = await interaction.reply({
        content: message_string,
        fetchReply: true,
    })

    for (let i in answers) {
        message.react(emojis[i])
    }


}