import { ChannelType, Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { LogManager } from '../logger/logger'

export default {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Generiert einen Einladungslink für diesen Server'),
  async execute(interaction: CommandInteraction): Promise<void> {
    const logger = LogManager.getInstance().logger('InviteCommand')
    try {
      const guild = interaction.guild
      if (!guild) {
        await interaction.reply({
          content: 'Dieser Befehl kann nur auf einem Server ausgeführt werden.',
          ephemeral: true
        })
        return
      }

      if (interaction.channel?.type !== ChannelType.GuildText) {
        await interaction.reply({
          content: 'Dieser Befehl kann nur in einem Textkanal ausgeführt werden.',
          ephemeral: true
        })
        return
      }

      const inviteLink = await guild.invites.create(interaction.channel, {
        maxAge: 2 * 60 * 60, // 2 hours
        maxUses: 1
      })

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: 'PlaceholderBot' })
            .setTitle('Einladungslink')
            .setDescription(
              `Hier ein Einladungslink für diesen Server: ${inviteLink.url}\nDer Einladungslink ist für 2h und maximal eine Verwendung gültig. Für permanente Links, nutze einen von <@${guild.ownerId}> bereitgestellten Link (z.B. unter YouTube Videos).`
            )
            .setColor(Colors.Navy)
        ],
        ephemeral: true
      })
    } catch {
      try {
        await interaction.reply({
          content: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
          ephemeral: true
        })
      } catch {
        // ignore and log
        logger.logSync('ERROR', 'Invite Link konnte nicht gesendet werden')
      }
    }
  }
}
