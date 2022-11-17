import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, DiscordAPIError } from 'discord.js'
import { Logger } from 'src/logger/logger'
import { EmbedBuilder, Colors } from 'discord.js';
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

    let { data } = await axios.get(`https://meme-api.herokuapp.com/gimme/${pickSubReddit}`);

    let postMeme = new EmbedBuilder()
        .setAuthor({
            name: `/u/${data.author}`,
        })
        .setTitle(data.title)
        .setImage(data.url)
        .setURL(data.postLink)
        .setColor(Colors.Green)
        .setTimestamp()
        .setFooter({ text: `/r/${data.subreddit}  • Upvotes: ${data.ups} ` })

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
            ephemeral: false,
        })
        logger.logSync('INFO', 'Meme versendet')
    } catch (e) {
        logger.logSync('ERROR', `Meme konnte nicht gesendet werden. ${e}`)
    }
}
