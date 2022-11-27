import { Client, Colors, CommandInteraction, EmbedBuilder } from 'discord.js'
import { AsyncDatabase } from 'src/sqlite/sqlite'
import { ILogger } from '../logger/logger'
import { v4 as uuid } from 'uuid'

export default async (client: Client, interaction: CommandInteraction, logger: ILogger, db: AsyncDatabase): Promise<void> => {
  if (!interaction.isRepliable()) {
    logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
    return
  }

  const target = interaction.options.get('target', true).value?.toString() ?? ''
  const reason = interaction.options.get('reason', true).value?.toString() ?? ''
  let dmSucess: boolean

  const kickEmbed = new EmbedBuilder()
    .setTitle('User wurde gekickt')
    .setDescription(`<@${target}> wurde erfolgreich gekickt und wurde benachrichtigt.`)
    .setColor('Yellow')
    .setAuthor({ name: `Gekickt von: ${interaction.user.tag}` })
    .setTimestamp()

  const dmDisabled = new EmbedBuilder()
    .setTitle('User wurde gekickt')
    .setDescription(`<@${target}> wurde erfolgreich gekickt. Die Banachrichtigung konnte nicht verschickt werden.`)
    .setColor('Yellow')
    .setAuthor({ name: `Gekickt von: ${interaction.user.tag}` })
    .setTimestamp()
    .addFields({ name: 'Grund', value: reason })

  try {
    await db.runAsync('INSERT INTO records (uuid, dc_id, type, points, reason) VALUES (?, ?, \'KICK\', 100, ?)', [
      uuid(), target, reason
    ])
  } catch (e) {
    logger.logSync("ERROR", `SQLITE-ERROR: ${JSON.stringify(e)}`)
  }

  try {
    await (await client.users.fetch(target)).send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Kick')
          .setDescription('Aufgrund deines Verhaltens wurdest du vom Server gekickt. Wir bitten dich zukünftig unsere Regeln zu beachten. Bist du der Meinung, zu unrecht gekickt worden zu sein, melde dich bitte bei uns persönlich.')
          .addFields({ name: 'Grund', value: reason })
          .setColor(Colors.Red)
      ]
    })
    dmSucess = true
  } catch (e) {
    dmSucess = false
  }

  try {
    await interaction.guild?.members.kick(target, reason)
    logger.logSync('INFO', `Nutzer mit ID ${target} wurde gekickt.`)
  } catch (e) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription('Der Kick ist fehlgeschlagen.')
      ],
      ephemeral: true
    })
    return
  }

  try {
    if (dmSucess) {
      await interaction.reply({ embeds: [kickEmbed], ephemeral: true })
    } else {
      await interaction.reply({ embeds: [dmDisabled], ephemeral: true })
    }
  } catch (e) {
    logger.logSync('ERROR', 'Interaction konnte nicht beantwortet werden.')
  }
}
