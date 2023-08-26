import { SlashCommandBuilder } from 'discord.js'
import { registerBlackJackCommands } from './blackjack/registerCommands'

export default [
  /*
    Report-System-Commands
    */
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
  /*
    Info-Text-Commands
    */
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
