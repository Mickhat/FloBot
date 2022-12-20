import { Client, CommandInteraction, EmbedBuilder, Colors, GuildMember } from 'discord.js'
import { ILogger } from 'src/logger/logger'
import { randomInt } from 'crypto'
import { nicknames } from './rename-names'

export default async function rename (client: Client, interaction: CommandInteraction, logger: ILogger): Promise<void> {
  const user = interaction.options.getMember('target') as GuildMember
  const userid = user.id

  const nickname = nicknames[randomInt(nicknames.length)]

  await interaction.guild?.members.edit(userid, { nick: `${nickname}` })
  let dmSucess = false
  try {
    const dm = await client.users.fetch(userid)
    await dm.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Umbennenung')
          .setDescription('Es tut uns sehr leid, jedoch sind wir gezwungen dich aufgrund deines Nicknames auf dem Server umzubennen. Du kannst deinen Nickname unter Serverprofil ändern.')
          .setColor(Colors.Yellow)
      ]
    })
    dmSucess = true
  } catch (e) {
    dmSucess = false
  }
  if (dmSucess) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setTitle(`Der Username wurde erfolgreich zu ${nickname} geändert und eine DM wurde verschickt.`)
          .setColor(Colors.Yellow)
      ],
      ephemeral: false
    })
  } else {
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setTitle(`Der Username wurde erfolgreich zu ${nickname} geändert. Eine DM konnte nich verschickt werden`)
          .setColor(Colors.Yellow)
      ],
      ephemeral: false
    })
  }
}
