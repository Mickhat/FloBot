import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, SlashCommandUserOption, SlashCommandStringOption } from 'discord.js'

export default [
    /*
    Commands, um einen Nutzer zu reporten.
    */
    new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message)
        .setName('REPORT').setDMPermission(false),
    new ContextMenuCommandBuilder().setType(ApplicationCommandType.User)
        .setName('REPORT').setDMPermission(false),
    /*
    Commands, um sich zu verifizieren / Captcha
    */
    new SlashCommandBuilder().setName('verify').setDescription('Dich verifizieren lassen')
        .setDMPermission(false),
    new SlashCommandBuilder().setName('verify-button').setDescription('Einen Verifizieren-Button erstellen')
        .setDMPermission(false),
    /*
    Info-Nachrichten
    */
    new SlashCommandBuilder().setName('metafrage')
        .setDescription("Zeigt eine Nachricht über Metafragen an")
        .setDMPermission(false)
        .addUserOption((builder: SlashCommandUserOption) =>
            builder.setName('Ping')
                .setDescription('Der Nutzer, der gepingt werden soll.')
                .setRequired(false)),
    new SlashCommandBuilder().setName('codeblocks')
        .setDescription("Zeigt eine Nachricht über Codeblocks an")
        .setDMPermission(false)
        .addUserOption((builder: SlashCommandUserOption) =>
            builder.setName('Ping')
                .setDescription('Der Nutzer, der gepingt werden soll.')
                .setRequired(false)),
    /*
    Role Toggle System
    */
    new SlashCommandBuilder().setName('role')
        .setDescription('Dir bestimmte Rollen geben / entfernen'),
    new SlashCommandBuilder().setName('role-force-button')
        .setDescription('Einen Button zum verteilen von Rollen anzeigen')
]
