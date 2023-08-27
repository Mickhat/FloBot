import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import LogManager from "../logger/logger"
import fs from "node:fs"

export default {
  data: new SlashCommandBuilder().setName('about')
    .setDescription('About me'),
  async execute (interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger('AboutCommand')
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }

    let buildInfo = ''

    if (fs.existsSync('./.build-info')) {
      buildInfo = fs.readFileSync('./.build-info', { encoding: 'utf-8' })
    } else {
      buildInfo = '.build-info konnte nicht gefunden werden'
    }

    const aboutEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Etwas über mich')
      .setAuthor({ name: 'Moderation Bot', url: 'https://discord.js.org' })
      .setDescription('Ich bin ein Discord-Bot, der für die Administration, Verwaltung und Moderation des Servers von <@950222367311937606> erstellt wurde. ' +
        'Um zu sehen, was ich alles kann, nutze einfach /help.\n\n**__Meine Entwickler:__**')
      // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addFields(
        { name: 'heeecker', value: '<@768872955500953710>\nheeecker', inline: true },
        { name: 'oglimmer', value: '<@441658607818375183>\noglimmer', inline: true },
        { name: 'Christian.sh', value: '<@779419763938951228>\nchristian.sh', inline: true },
        { name: 'Mickhat', value: '<@226223176269561857>\nmickhat', inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: 'Github Build:', value: buildInfo },
        { name: 'Github Repo:', value: 'https://github.com/Mickhat/FloBot' }
      )
      .setTimestamp()
      .setFooter({ text: '\u200B', iconURL: 'https://cdn.discordapp.com/attachments/959462282939756624/1041868727613927424/flobot.png' })

    try {
      await interaction.reply({
        embeds: [aboutEmbed]
      })
      logger.logSync('INFO', 'About-info gesendet.')
    } catch (err) {
      logger.logSync('ERROR', `About-Info konnte nicht gesendet werden. ${JSON.stringify(err)}`)
    }
  }
}
