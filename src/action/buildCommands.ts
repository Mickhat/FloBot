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
    /*
    Toggle-Role-Commands
    */
    new SlashCommandBuilder().setName('role')
        .setDescription('Dir bestimmte Rollen geben / entfernen'),
    new SlashCommandBuilder().setName('role-force-button')
        .setDescription('Einen Button zum verteilen von Rollen anzeigen')
]
