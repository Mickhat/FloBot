import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js'
import { adjectives, colors, nicknames } from '../data/rename-names'
import { randomInt } from 'node:crypto'

const caseCorrectAndRemoveSpaces = (input: string): string => {
  return (input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()).replace(/ /g, '')
}

export default {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Ändert deinen Benutzernamen in einen random Namen auf dem Server')
    .addUserOption((opt) =>
      opt.setName('target').setDescription('Die Person, dessen Name geändert werden soll').setRequired(true)
    ),
  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.options.getMember('target') as GuildMember
    const userid = user.id

    const nick =
      caseCorrectAndRemoveSpaces(adjectives[randomInt(adjectives.length)]) +
      caseCorrectAndRemoveSpaces(colors[randomInt(colors.length)]) +
      caseCorrectAndRemoveSpaces(nicknames[randomInt(nicknames.length)])

    await interaction.guild?.members.edit(userid, { nick })
    let dmSucess = false
    try {
      const dm = await interaction.client.users.fetch(userid)
      await dm.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Umbennenung')
            .setDescription(
              'Es tut uns sehr leid, jedoch sind wir gezwungen dich aufgrund deines Nicknames auf dem Server umzubenennen. Du kannst deinen Nickname unter *Server > Serverprofil* ändern.'
            )
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
          new EmbedBuilder()
            .setTitle(`Der Username wurde erfolgreich zu ${nick} geändert und eine DM wurde verschickt.`)
            .setColor(Colors.Yellow)
        ],
        ephemeral: false
      })
    } else {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Der Username wurde erfolgreich zu ${nick} geändert. Eine DM konnte nicht verschickt werden`)
            .setColor(Colors.Yellow)
        ],
        ephemeral: false
      })
    }
  }
}
