import discord from 'discord.js'
import sqlite from 'sqlite3'
import { Logger } from '../logger/logger'
import { v4 as uuid } from 'uuid'

export default async (interaction: discord.UserContextMenuCommandInteraction,
    client: discord.Client,
    db: sqlite.Database,
    logger: Logger) => {

    logger.logSync("INFO", "New user report")

    let reportId = uuid()

    interaction.reply({
        content: "Du bist dabei einen Nutzer zu reporten. Hier ist eine Vorschau des Berichts. Gebe bitte mehr Informationen an, damit wir schneller und geziehlter handeln können.",
        embeds: [
            new discord.EmbedBuilder()
                .setAuthor({
                    name: '🚩 REPORT-SYSTEM'
                })
                .setColor(discord.Colors.Red)
                .setTitle('Report')
                .setDescription('<Keine Beschreibung>')
                .addFields({ name: 'Absender', value: interaction.user.toString() },
                    { name: 'Beschuldigt', value: interaction.targetUser.toString() },
                    { name: 'Regel', value: '<nicht gegeben>' },
                    { name: 'ID', value: reportId },
                    { name: 'Status', value: 'Bearbeitung' },
                    { name: 'Nachricht', value: '<keine Nachricht>' }
                )
        ],
        ephemeral: true,
        components: [
            new discord.ActionRowBuilder<discord.SelectMenuBuilder>()
                .addComponents(
                    new discord.SelectMenuBuilder()
                        .setCustomId(`user_report_${reportId}_category`)
                        .setPlaceholder('Verstoßene Regel / Kategorie angeben')
                        .addOptions(
                            {
                                label: '1 - Person nicht Pingbar', value: '1'
                            },
                            {
                                label: '2 - NSWF im Namen',
                                value: '2.1'
                            },
                            {
                                label: '2 - NSWF im Profilbild',
                                value: '2.2'
                            },
                            {
                                label: '2 - NSWF im Status / AboutMe',
                                value: '2.3'
                            },
                            {
                                label: '2 - NSWF als Nachricht',
                                value: '2.4'
                            },
                            {
                                label: '3 - Private Daten eines Fremden',
                                value: '2.5'
                            },
                            {
                                label: '4 - Missbrauch von Channels',
                                value: '4'
                            },
                            {
                                label: '5 - Spamm',
                                value: '5.1'
                            },
                            {
                                label: '5 - unangebrachte Pings',
                                value: '5.2'
                            },
                            {
                                label: '6 - Bots',
                                value: '5.3'
                            },
                            {
                                label: '7 - Respektloser Umgang',
                                value: '7'
                            },
                            {
                                label: '9 - Werbung für andere Medien',
                                value: '8'
                            },
                            {
                                label: '10 - Starfumgehung',
                                value: '10'
                            },
                            {
                                label: '11 - Self-Botting',
                                value: '11'
                            },
                            {
                                label: '13 - schädliche oder ausführbare Dateien',
                                value: '13'
                            },
                            {
                                label: '15 - Verstoß Deutsches Recht',
                                value: '15'
                            },
                            {
                                label: '17 - Werbung',
                                value: '17'
                            },
                            {
                                label: 'anderweitiger Verstoß',
                                value: '18'
                            }

                        )
                )
        ]
    })
    db.run(
        `INSERT INTO reports (uuid, creator_id, reported_id, status, category) VALUES (?, ?, ?, ?, 'UNKNOWN')`,
        [reportId, interaction.member?.user.id, interaction.targetMember?.user.id, 0])
    // Status 0 = just created

}
