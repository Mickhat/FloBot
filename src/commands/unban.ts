import { SlashCommandBuilder } from '@discordjs/builders'
import { Colors, CommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import LogManager from '../logger/logger'

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription('Entfernt eine Person von der Blacklist')
    .addUserOption((opt) =>
      opt.setName('target').setDescription('Die Person, die entbannt werden soll').setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger('UnbanCommand')
    if (!interaction.isRepliable()) {
      logger.logSync('ERROR', 'Gegebene interaction kann nicht beantwortet werden.')
      return
    }

    const target = interaction.options.get('target', true).value?.toString() ?? ''

    const dmDisabled = new EmbedBuilder()
      .setTitle('User wurde entbannt')
      .setDescription(`<@${target.toString()}> hat seine DMS deaktiviert.`)
      .setColor(Colors.Green)
      .setAuthor({ name: `Entbannt von: ${interaction.user.username}` })
      .setTimestamp()

    try {
      await interaction.guild?.members.unban(target)
      await interaction.reply({ embeds: [dmDisabled] })

      logger.logSync('INFO', 'Entbannung wurde erfolgreich ausgefuehrt')
      logger.logSync('INFO', `User <@${target.toString()}> wurde entbannt.`)
    } catch (err) {
      logger.logSync('ERROR', `Entbannung konnte nicht ausgefuehrt werden. ${JSON.stringify(err)}`)
    }
  }
}
