import discord, { ButtonBuilder } from 'discord.js'
import { Logger } from '../logger/logger'

/**
 * Creates a role choose panel with buttons
 * @param {discord.Interaction} interaction
 * @param { "global" | "once"} mode
 */
export async function createRoleInterface (interaction: discord.CommandInteraction, mode: 'global' | 'once', logger: Logger): Promise<void> {
  const toggleRoles: string[] = process.env.TOGGLE_ROLES?.split(',').filter(val => val !== '') ?? []
  const buttons: Array<discord.ActionRowBuilder<ButtonBuilder>> = []

  logger.logSync('DEBUG', `Verfügbare Rollen: ${JSON.stringify(toggleRoles)}`)

  for (const rId of toggleRoles) {
    logger.logSync('DEBUG', `Erstelle Button für Rolle: ${rId}`)

    if (interaction == null) {
      logger.logSync('ERROR', 'Interaction nicht gefunden...')
      return
    }
    if (interaction.guild == null) {
      logger.logSync('ERROR', 'Guild nicht gefunden')
      return
    }
    const role = await interaction.guild.roles.fetch(rId)
    if (role == null || role.name == null) {
      logger.logSync('ERROR', 'Rolle nicht gefunden')
      return
    }

    buttons.push(new discord.ActionRowBuilder<ButtonBuilder>().addComponents(
      new discord.ButtonBuilder()
        .setLabel(role.name)
        .setStyle(discord.ButtonStyle.Secondary)
        .setCustomId('do_nothing' + idGen()),
      new discord.ButtonBuilder()
        .setLabel('+')
        .setCustomId(`addRole-${role.id}`)
        .setStyle(discord.ButtonStyle.Success),
      new discord.ButtonBuilder()
        .setLabel('-')
        .setCustomId(`removeRole-${role.id}`)
        .setStyle(discord.ButtonStyle.Danger)))
  }
  if (interaction.isRepliable()) {
    await interaction.reply({
      embeds: [
        new discord.EmbedBuilder()
          .setTitle('Rollenübersicht')
          .setDescription(
            (buttons.length === 0) ? 'Es sind keine Rollen verfügbar' : 'Hier sind alle Rollen, die du dir selbst geben oder nehmen kannst.\nDrücke die + oder - Buttons, um dir eine Rolle zu geben oder zu entfernen.')
          .setFooter({
            text: 'Kontaktiere einen Administrator oder Moderator, wenn du Hilfe brauchst.'
          })
      ],
      components: [
        ...buttons
      ],
      ephemeral: (mode === 'once')
    })
  }
}

function idGen (): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  let result = ''
  for (let index = 0; index < 20; index++) {
    result += letters[Math.floor(Math.random() * letters.length)]
  }
  return result
}
