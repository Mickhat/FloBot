import { Client, CommandInteraction, DiscordAPIError } from 'discord.js'
import { Logger } from 'src/logger/logger'
import { EmbedBuilder, Message, Colors } from 'discord.js';
import axios from 'axios'

export async function meme(client: Client, interaction: CommandInteraction, logger: Logger) {

    if (!interaction.isRepliable() || !interaction.reply) {
        logger.logSync("ERROR", "Gegebene interaction kann nicht beantwortet werden.")
        return;
    }

    let subReddit = [
        'techhumor',
        'programmerhumor',
        'ITMemes'
    ]
    
    let pickSubReddit = subReddit[Math.floor(Math.random() * subReddit.length)]
    let {data }  = await axios.get(`https://meme-api.herokuapp.com/gimme/${pickSubReddit}`);

    let postMeme = new EmbedBuilder()
    .setTitle(data.title)
    .setImage(data.url)
    .setURL(data.postLink)
    .setColor(Colors.Green)
    .setTimestamp()
    .setFooter({ text: `Meme von: ${data.subreddit}  • Upvotes: ${data.ups} ` })

    interaction.reply({
        embeds: [postMeme]
    }).then(() => {
        logger.logSync("INFO", "Meme wurde erfolgreich gesendet.")
    }).catch(() => {
        logger.logSync("ERROR", "Meme konnte nicht gesendet werden.")
    })
}
