import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

export default [
    /*
    Report-System-Commands
    */
    new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message)
        .setName('REPORT').setDMPermission(false),
    new ContextMenuCommandBuilder().setType(ApplicationCommandType.User)
        .setName('REPORT').setDMPermission(false),
    /*
    Captcha-System-Commands
    */
    new SlashCommandBuilder().setName('verify').setDescription('Dich verifizieren lassen')
        .setDMPermission(false),
    new SlashCommandBuilder().setName('verify-button').setDescription('Einen Verifizieren-Button erstellen')
        .setDMPermission(false),
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
            .setDescription('Das Ticket schließen') /* */
]
