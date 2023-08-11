import { ChannelType, Client, Colors, CommandInteraction, EmbedBuilder } from 'discord.js'
import { ILogger } from 'src/logger/logger'
import fs from 'fs'

export async function metafrage (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  try {
    await interaction.reply({
      content: `**Metafragen** sind Fragen, welche oft vor einer richtigen Frage gestellt werden.
Klassische Beispiele für Metafragen sind:
- Kann mir jemand mit JavaScript helfen?
- Wer kennt sich mit IP-Adressen aus?
Solche Fragen verhindern eine schnelle Antwort auf die eigentliche Frage. Oft denkt jemand nicht, im Fachgebiet "gut genug" zu sein, kennt aber die Antwort und könnte trotzdem nicht antworten. Auch wenn sich jemand meldet, muss er erst auf die Antwort des Fragestellers warten, bis er antworten kann.
__Stelle deine Frage direkt, ohne erstmal nach einem Experten zu suchen. Dies erspart dir Zeit und erhöht die Chance auf eine Antwort.__
[mehr Informationen](http://metafrage.de/)`
    })
    logger.logSync('INFO', 'Metafragen-Info gesendet.')
  } catch (err) {
    logger.logSync('ERROR', `Metafragen-Info konnte nicht gesendet werden!. Error: ${JSON.stringify(err)}`)
  }
}
export async function codeblocks (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  try {
    await interaction.reply({
      content: `**Codeblocks** sind in discord-Nachrichten integrierbare Blöcke, die Quellcode enthalten. Sie sehen so aus:
\`\`\`py
print("Hello World")
\`\`\`
Du erstellst sie mit drei \\\` vor deinem Code und drei \\\` nach deinem Code. Um das Syntax-Highlighting zu aktivieren, kannst du nach den ersten drei \\\` die Sprache dazuschreiben.
Der Codeblock von oben sieht so aus:
\\\`\\\`\\\`py
print("Hello World")
\\\`\\\`\\\`
Dadurch machst du deinen Code, im Vergleich zu normalem Text, besser lesbar für alle und kannst schneller eine Antwort auf deine Frage bekommen. Auch sind sie, im Vergleich zu Screenshots, sehr Datensparsam.
Codeblocks sind die beste Art, Code auf Discord zu teilen, und alle werden dir Dankbar sein, wenn du sie nutzt.
`
    })
    logger.logSync('INFO', 'Codeblock-Info gesendet.')
  } catch (err) {
    logger.logSync('ERROR', `Codeblock-Info konnte nicht gesendet werden. Error: ${JSON.stringify(err)}`)
  }
}

export async function about (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> {
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

export async function ping (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true })

  try {
    await interaction.editReply({
      content: `PONG!\nCurrent Bot latency: ${client.ws.ping}ms\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`
    })
    logger.logSync('INFO', 'Pong wurde erfolgreich gesendet.')
  } catch (err) {
    logger.logSync('ERROR', `Ping konnte nicht gesendet werden. Error ${JSON.stringify(err)}`)
  }
}

/**
 * Create an one use invite link for the server and send it to the user
 * @param interaction
 */
export async function invite (interaction: CommandInteraction, logger: ILogger): Promise<void> {
  try {
    const guild = interaction.guild
    if (!guild) {
      await interaction.reply({ content: 'Dieser Befehl kann nur auf einem Server ausgeführt werden.', ephemeral: true })
      return
    }

    if (interaction.channel?.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Dieser Befehl kann nur in einem Textkanal ausgeführt werden.', ephemeral: true })
      return
    }

    const inviteLink = await guild.invites.create(interaction.channel, {
      maxAge: 24 * 60 * 60, // 24 hours
      maxUses: 1
    })

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: 'FloBot' })
          .setTitle("Einladungslink")
          .setDescription(`Hier ein Einladungslink für diesen Server: ${inviteLink.url}\nDer Einladungslink ist für 24h und maximal eine Verwendung gültig. Für permanente Links, nutze einen von <@${guild.ownerId}> bereitgestellten Link (z.B. YouTube Videos).`)
          .setColor(Colors.Navy)
      ],
      ephemeral: true
    })
  } catch {
    try {
      await interaction.reply({ content: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', ephemeral: true })
    } catch {
    // ignore and log
      logger.logSync("ERROR", "Invite Link konnte nicht gesendet werden")
    }
  }
}
