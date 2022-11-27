import { Client, CommandInteraction, EmbedBuilder, Colors } from 'discord.js'
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

  // record
  try {
    await db.runAsync('INSERT INTO records (uuid, dc_id, type, points, reason) VALUES (?, ?, \'BAN\', 100, ?)', [
      uuid(), target, reason
    ])
  } catch (e) {
    logger.logSync('ERROR', `SQLITE-ERROR: ${JSON.stringify(e)}`)
  }

  // send dm
  try {
    const dm = await client.users.fetch(target)
    await dm.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Ban')
          .setDescription('Es tut uns sehr leid, jedoch sind wir gezwungen dich aufgrund deines Verhaltens vom Server auszuschließen. Bist du der Meinung, zu unrecht gebannt worden zu sein, melde dich bitte bei uns persönlich.')
          .addFields(
            { name: 'Grund', value: reason }
          )
          .setColor(Colors.Red)
      ]
    })
    dmSucess = true
  } catch (e) {
    dmSucess = false
  }

  try {
    await interaction.guild?.members.ban(target, { reason })
    logger.logSync("INFO", `Nutzer mit der ID ${target} wurde gebannt.`)
  } catch (e) {
    logger.logSync('ERROR', `Ban ${target} konnte nicht ausgefuehrt werden. ${JSON.stringify(e)}`)
    await interaction.reply({
      ephemeral: true,
      content: 'Der Ban war erfolgslos.'
    })
    return
  }

  try {
    if (dmSucess) {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('User wurde gebannt')
          .setDescription(`<@${target.toString()}> wurde erfolgreich benachrichtigt und gebannt.`)
          .setColor(Colors.Red)
          .setAuthor({ name: `Gebannt von: ${interaction.user.tag}` })
          .addFields({ name: 'Grund', value: reason })
          .setTimestamp()],
        ephemeral: true
      })
    } else {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('User wurde gebannt')
          .setDescription(`<@${target.toString()}> wurde erfolgreich gebannt. Die Benachrichtigung konnte nicht versendet werden.`)
          .setColor(Colors.Red)
          .setAuthor({ name: `Gebannt von: ${interaction.user.tag}` })
          .setTimestamp()
          .addFields({ name: 'Grund', value: reason })],
        ephemeral: true
      })
    }
  } catch (e) {
    logger.logSync("ERROR", 'Interaction could not be replied.')
  }
}
