import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  CommandInteraction,
  TextChannel,
  NewsChannel,
  VoiceChannel
} from 'discord.js'

const channelsToMove = [
  // List of channel IDs
  '955865282709188640', // #vorstellungsrunde
  '1171933755032735804', // #mathe-mit-klemmbausteinen
  '955867141968638032', // #flotaku
  '1169407539713151087', // #youtube-livestreams
  '1169010139718746112', // #cyberanwalt
  '955865970788925440', // #videowünsche
  '955864641928593408', // #mathematik
  '955864692167938088', // #netzwerktechnik
  '955864732022210562', // #betriebssysteme
  '963566272103202846', // #cybersicherheit
  '961741106813493320', // #hardware
  '960552914152226846', // #kryptographie
  '955864768760131594', // #theoretische-informatik
  '961752368490381402', // #it-allgemein
  '959419767398207549', // #off-topic
  '955865939704954911', // #projekte
  '1056618386521591919', // #essen
  '961752018396020817', // #memes
  '991336423456243812', // #gaming
  '995445771472212148' // #bildung-karriere
]

export default {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Setzt ausgewählte Channels auf dem Server auf schreibgeschützt'),
  
  async execute (interaction: CommandInteraction) {
    const guild = interaction.guild

    if (!guild) {
      await interaction.reply('Dieser Befehl kann nur auf einem Server ausgeführt werden.')
      return
    }

    await Promise.all(channelsToMove.map(async channelId => {
      const channel = await guild.channels.fetch(channelId)
      if (channel && (channel instanceof TextChannel || channel instanceof NewsChannel || channel instanceof VoiceChannel)) {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SEND_MESSAGES: false
        })
      }
    }))

    await interaction.reply('Die ausgewählten Kanäle wurden auf schreibgeschützt gesetzt.')
  }
}
