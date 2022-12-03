import { Client, CommandInteraction, EmbedBuilder, Colors } from 'discord.js'
import { ILogger } from 'src/logger/logger'
import { AxiosError } from 'axios'
import https from 'https'

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
    https.get(`https://meme-api.com/gimme/${pickSubReddit}`, res => {
      const data = [] as any

      res.on('data', chunk => {
        data.push(chunk)
      })

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      res.on('end', async () => {
        console.log('Response ended: ')
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const dataJson = JSON.parse(Buffer.concat(data).toString()) as any

        const postMeme = new EmbedBuilder()
          .setAuthor({
            name: `/u/${dataJson.author as string}`
          })
          .setTitle(dataJson.title)
          .setImage(dataJson.url)
          .setURL(dataJson.postLink)
          .setColor(Colors.Green)
          .setTimestamp()
          .setFooter({ text: `/r/${dataJson.subreddit as string}  • Upvotes: ${dataJson.ups as string} ` })

        await interaction.reply({
          embeds: [postMeme],
          ephemeral: false
        })
        logger.logSync('INFO', 'Meme versendet')
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          interaction.editReply({ components: [] })
          logger.logSync('INFO', 'Deleted delete-button')
        }, 30000)
      })
    }).on('error', err => {
      console.log('Error: ', err.message)
    })
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
