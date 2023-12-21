import { EmbedBuilder } from "@discordjs/builders"
import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  CommandInteraction,
  GuildTextBasedChannel,
  ChannelType,
  Colors,
  TextChannel,
  NewsChannel,
  VoiceChannel
} from "discord.js"

const channelsToMove = [
  "955865282709188640", // #vorstellungsrunde
  "1171933755032735804", // #mathe-mit-klemmbausteinen
  "955867141968638032", // #flotaku
  "1169407539713151087", // #youtube-livestreams
  "1169010139718746112", // #cyberanwalt
  "955865970788925440", // #videowünsche
  "955864641928593408", // #mathematik
  "955864692167938088", // #netzwerktechnik
  "955864732022210562", // #betriebssysteme
  "963566272103202846", // #cybersicherheit
  "961741106813493320", // #hardware
  "960552914152226846", // #kryptographie
  "955864768760131594", // #theoretische-informatik
  "961752368490381402", // #it-allgemein
  "959419767398207549", // #off-topic
  "955865939704954911", // #projekte
  "1056618386521591919", // #essen
  "961752018396020817", // #memes
  "991336423456243812", // #gaming
  "995445771472212148" // #bildung-karriere
]

export default {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Schreibt eine Nachricht mit einem Embed zum neuen Server"),

  async execute (interaction: CommandInteraction) {
    const channelList: GuildTextBasedChannel[] = []
    const guild = interaction.guild

    if (!guild) {
      await interaction.reply("Dieser Befehl kann nur auf einem Server ausgeführt werden.")
      return
    }

    // Fetch channels and filter text channels
    await Promise.all(channelsToMove.map(async channelId => {
      const channel = await guild.channels.fetch(channelId)
      if (channel?.type === ChannelType.GuildText) {
        channelList.push(channel)
      }
    }))

    // Embed message
    const embed = new EmbedBuilder()
      .setTitle("Wir ziehen um!")
      .setDescription("Dieser Server wird leider geschlossen. https://discord.gg/65pXxkSE5g Komm doch einfach vorbei!")
      .setFooter({ text: "Der neue Server gehört Mickhat. Er wird nicht von Florian Dalwigk betrieben." })
      .setColor(Colors.Aqua)

    // Send embed and update channel permissions
    await Promise.all(channelList.map(async channel => {
      await channel.send({ embeds: [embed] })

      // Check if channel is TextChannel, NewsChannel, or VoiceChannel
      if (channel instanceof TextChannel || channel instanceof NewsChannel || channel instanceof VoiceChannel) {
        // Setting the channel to read-only for @everyone
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false,
          SendMessagesInThreads: false
        })
      }
    }))
  }
}
