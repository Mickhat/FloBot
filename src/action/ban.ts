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

  try {
    await interaction.guild?.members.ban(target)
    try {
      try {
        await db.runAsync('INSERT INTO records (uuid, dc_id, type, points, reason) VALUES (?, ?, \'BAN\', 100, ?)', [
          uuid(), target, reason
        ])
      } catch (e) {
        logger.logSync('ERROR', `SQLITE-ERROR: ${JSON.stringify(e)}`)
      }
      const dm = await client.users.fetch(target)
      await dm.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Ban')
            .setDescription('Es tut uns sehr leid, jedoch sind wir gezwungen dich aufgrund deines Verhaltens vom Server auszuschließen. Bist du der Meinung, zu unrecht gebannt worden zu sein, melde dich bitte bei uns persönlich.')
            .addFields(
              { name: 'Grund', value: reason }
            )
        ]
      })
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
    } catch (err) {
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
    logger.logSync('INFO', 'Ban wurde erfolgreich ausgefuehrt')
    logger.logSync('INFO', `User <@${target.toString()}> wurde gebannt.Grund: ${reason}`)
  } catch (err) {
    logger.logSync('ERROR', `Ban konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
  }
}
