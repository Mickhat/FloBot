import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } from 'discord.js'
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
  new SlashCommandBuilder().setName('history')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Sieht die Historie eines Users ein')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, dessen Historie eingesehen werden soll')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('clear')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Leert die Historie eines Users')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, dessen Historie geleert werden soll')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('warn')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Verwarnt eine Person')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die verwarnt werden soll')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('reason')
        .setDescription('Der Grund für den /warn')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('rename')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Ändert deinen Benutzernamen in einen random Namen auf dem Server')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, dessen Name geändert werden soll')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('strike')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Verwarnt eine Person und erteilt einen Strike.')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die einen Strike bekommen soll')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('reason')
        .setDescription('Der Grund für den /strike')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('kick')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Kickt eine Person vom Server.')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die gekickt werden soll')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('reason')
        .setDescription('Der Grund für den kick')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('timeout')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDescription('Versetzt eine Person in einem Timeout..')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die einen Timeout erhalten soll')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('reason')
        .setDescription('Der Grund für den Timeout')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('zeit')
        .setDescription('Wie lange soll der Timeout sein?')
        .setRequired(true)
    ),
  //   .addIntegerOption(
  //       opt => opt.setName('weight')
  //           .setDescription('Die Anzahl von Punkten, die der Person angerechnet werden')
  //           .setMinValue(6)
  //           .setMaxValue(11)
  //           .setRequired(true)
  //   ),
  new SlashCommandBuilder().setName('ban')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription('Entfernt eine Person final vom Server')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die gebannt werden soll')
        .setRequired(true)
    )
    .addStringOption(
      opt => opt.setName('reason')
        .setDescription('Der Grund für den /ban')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('unban')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription('Entfernt eine Person von der Blacklist')
    .addUserOption(
      opt => opt.setName('target')
        .setDescription('Die Person, die entbannt werden soll')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('google')
    .setDescription('Google-Suche')
    .addStringOption(option => option.setName('query')
      .setDescription('Was soll gesucht werden?')
      .setRequired(true))
    .addStringOption(o => o
      .setName('engine')
      .addChoices({ name: 'google', value: 'g' }, { name: 'duckduckgo', value: 'ddg' })
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
  new SlashCommandBuilder().setName('help')
    .setDescription('Was kann ich?'),
  new SlashCommandBuilder().setName('ping')
    .setDescription('ping'),
  new SlashCommandBuilder().setName('meme')
    .setDescription('Random memes von Reddit.'),
  /*
    Toggle-Role-Commands
    */
  new SlashCommandBuilder().setName('role')
    .setDescription('Dir bestimmte Rollen geben / entfernen'),
  new SlashCommandBuilder().setName('role-force-button')
    .setDescription('Einen Button zum verteilen von Rollen anzeigen'),
  /*
    Voting
    */
  new SlashCommandBuilder().setName('voting')
    .setDescription('Eine Umfrage / Abstimmung machen.')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Die Frage')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('answers')
        .setDescription('Die Antworten, mit Kommata getrennt')
        .setRequired(true)),
  new SlashCommandBuilder().setName('poll')
    .setDescription('Eine Umfrage / Abstimmung machen.')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Die Frage')
        .setRequired(true)),
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
  new SlashCommandBuilder().setName('giveaway')
    .setDescription('Etwas verlosen')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addStringOption(
      o => o.setName('item')
        .setDescription('Was soll verlost werden.')
        .setRequired(true)
    )
    .addStringOption(
      o => o.setName('time')
        .setDescription('Wie lange soll das Giveaway gehen? Default: 24h')
        .setRequired(false)
    ),
  new SlashCommandBuilder().setName('giveaway-eval')
    .setDescription('Ein Giveaway auswerten')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addStringOption(
      o => o.setName('messageid')
        .setDescription('Die ID der Nachricht vom Bot in dem der Giveaway verkündet wurde')
        .setRequired(true)
    ),
  /*
      Blackjack
  */
  registerBlackJackCommands()
]
