import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder, Colors } from 'discord.js'
import { ILogger } from 'src/logger/logger'
import axios, { AxiosError } from 'axios'
import { decompress } from 'brotli'

export async function meme (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> {
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

  try {
    const { data: brotliEncoded } = await axios.get(`https://meme-api.com/gimme/${pickSubReddit}`, { responseType: 'arraybuffer' })
    const textDecoder = new TextDecoder()
    const data = JSON.parse(textDecoder.decode(decompress(brotliEncoded)))

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
    console.log(err)
    if (err instanceof AxiosError) {
      let errorText
      if (err.response) {
        errorText = `http code was ${err.response.status} with ${JSON.stringify(err.response.data)}`
      } else if (err.request) {
        errorText = `No response. ${JSON.stringify(err.request)}`
      } else {
        errorText = `Error using axsio. ${JSON.stringify(err)}`
      }
      logger.logSync('ERROR', `Meme konnte nicht gesendet werden. ${errorText}`)
    } else {
      logger.logSync('ERROR', `Meme konnte nicht gesendet werden. ${JSON.stringify(err)}`)
    }
    const postMeme = new EmbedBuilder()
      .setAuthor({
        name: `Senior Error-Helper`
      })
      .setTitle('Es ist ein katastrophler Fehler beim laden des MEMEs aufgetreten! Es besteht jedoch kein Grund zur Panik! Bleiben sie ruhig!!!')
      .setImage('https://memesfeel.com/wp-content/uploads/2022/05/Everything-Is-Fine-Meme-1.jpg')
      .setColor(Colors.Green)
      .setTimestamp()
    await interaction.reply({
      embeds: [postMeme],
      components: [],
      ephemeral: false
    })
  }
}
