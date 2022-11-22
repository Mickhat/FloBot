import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder, Colors } from 'discord.js'
import { Logger } from 'src/logger/logger'
import axios from 'axios'

export async function meme (client: Client, interaction: CommandInteraction, logger: Logger): Promise<void> {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const subReddit = [
    'techhumor',
    'programmerhumor',
    'ITMemes'
  ]

  const pickSubReddit = subReddit[Math.floor(Math.random() * subReddit.length)]

  const { data } = await axios.get(`https://meme-api.herokuapp.com/gimme/${pickSubReddit}`)

  const postMeme = new EmbedBuilder()
    .setAuthor({
      name: `/u/${data.author as string}`
    })
    .setTitle(data.title)
    .setImage(data.url)
    .setURL(data.postLink)
    .setColor(Colors.Green)
    .setTimestamp()
    .setFooter({ text: `/r/${data.subreddit as string}  • Upvotes: ${data.ups as string} ` })

  try {
    await interaction.reply({
      embeds: [postMeme],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('delete')
            .setLabel('Löschen')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️')
        )
      ],
      ephemeral: false
    })
    logger.logSync('INFO', 'Meme versendet')
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      interaction.editReply({ components: [] })
      logger.logSync('INFO', 'Deleted delete-button')
    }, 30000)
  } catch (err) {
    logger.logSync('ERROR', `Meme konnte nicht gesendet werden. ${JSON.stringify(err)}`)
  }
}
