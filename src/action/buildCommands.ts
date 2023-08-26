import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js'
import { registerBlackJackCommands } from './blackjack/registerCommands'

export default [
  /*
    Report-System-Commands
    */
  new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message)
    .setName('REPORT').setDMPermission(false),
  new ContextMenuCommandBuilder().setType(ApplicationCommandType.User)
    .setName('REPORT').setDMPermission(false),
  /*
    Mod-Commands
    */
  //   .addIntegerOption(
  //       opt => opt.setName('weight')
  //           .setDescription('Die Anzahl von Punkten, die der Person angerechnet werden')
  //           .setMinValue(6)
  //           .setMaxValue(11)
  //           .setRequired(true)
  //   ),
  new SlashCommandBuilder().setName('search')
    .setDescription('Internet-Suche')
    .addStringOption(option => option.setName('query')
      .setDescription('Was soll gesucht werden?')
      .setRequired(true))
    .addStringOption(o => o
      .setName('engine')
      .addChoices({ name: 'searxng', value: 'x' }, { name: 'google', value: 'g' }, { name: 'duckduckgo', value: 'ddg' })
      .setDescription('Welche Suchmaschine soll verwendet werden?')
      .setRequired(false)
    ),
  /*
    Info-Text-Commands
    */
  new SlashCommandBuilder().setName('metafrage')
    .setDescription('Ein Text über Metafragen.'),
  new SlashCommandBuilder().setName('codeblocks')
    .setDescription('Ein Text über Codeblocks'),
  new SlashCommandBuilder().setName('about')
    .setDescription('About me'),
  /*
    Toggle-Role-Commands
    */
  new SlashCommandBuilder().setName('role')
    .setDescription('Dir bestimmte Rollen geben / entfernen'),
  new SlashCommandBuilder().setName('role-force-button')
    .setDescription('Einen Button zum verteilen von Rollen anzeigen'),
  /*
    Ticket-System
    */
  new SlashCommandBuilder().setName('ticket-create')
    .setDescription('Erstellt einen Channel, wo du mit dem Support-Team kommunizieren kannst'),
  new SlashCommandBuilder().setName('ticket-add')
    .setDescription('Ein Mitglied in den Channel einladen')
    .addUserOption(option => option.setName('target')
      .setDescription('Der Nutzer, der hinzugefügt werden soll')
      .setRequired(true)),
  new SlashCommandBuilder().setName('ticket-close')
    .setDescription('Das Ticket schließen'),
  /*
      Giveaway
  */
  /*
      Blackjack
  */
  registerBlackJackCommands()
]
