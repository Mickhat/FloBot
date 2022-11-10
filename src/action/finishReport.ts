import { Client, Colors, EmbedBuilder, ModalSubmitInteraction } from 'discord.js'
import { Database } from 'sqlite3'
import { Logger } from '../logger/logger';

interface result {

}

export default async (interaction: ModalSubmitInteraction, client: Client, db: Database, logger: Logger) => {


    if (!interaction) return;

    let uuid = interaction.customId.split('_')[1]
    console.log(`Report ${interaction.customId} ${uuid}`)
    db.get(`SELECT uuid, reported_id, status, category, message FROM reports WHERE uuid = ?`, [uuid], async (err, result) => {
        if (err) return interaction.reply("ID existiert nicht. Bitte mache den Report von neu.")
        db.run(`UPDATE reports SET description = ? WHERE uuid = ?`, [
            interaction.fields.getTextInputValue('description'), uuid
        ])
        if (err) interaction.reply("Ein Fehler ist geschehen, kontaktiere bitte einen Mod.")
        else {
            interaction.reply({
                content: "Du bist dabei einen Nutzer zu reporten. Hier ist eine Vorschau des Berichts. Gebe bitte mehr Informationen an, damit wir schneller und geziehlter handeln können.",
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: '🚩 REPORT-SYSTEM'
                        })
                        .setColor(Colors.Red)
                        .setTitle('Report')
                        .setDescription(interaction.fields.getTextInputValue('description'))
                        .addFields(
                            {
                                name: 'Absender',
                                value: `${interaction.member?.user.username}#${interaction.member?.user.discriminator} <@${interaction.member?.user.id}> #${interaction.member?.user.id}`,
                            },
                            {
                                name: 'Beschuldigt',
                                value: (await interaction.guild?.members.fetch(result?.reported_id ?? "") ?? "<ERROR>").toString()
                            },
                            {
                                name: 'Regel',
                                value: result?.category ?? "<ERROR>"
                            },
                            {
                                name: 'ID',
                                value: result?.uuid ?? "<ERROR>"
                            },
                            {
                                name: 'Status',
                                value: 'Fertig'
                            },
                            {
                                name: 'Verlinkte Nachricht',
                                value: result.message ?? "<_NULL_>"
                            }
                        )
                ],
                ephemeral: true
            })

            interaction.guild?.channels.fetch(process.env.REPORT_CHANNEL_ID ?? "").then(async (channel) => {
                if (!channel?.isTextBased()) {
                    return;
                }
                channel.send({
                    content: `Ein Report wurde erstellt.`,
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: '🚩 REPORT-SYSTEM'
                            })
                            .setColor(Colors.Red)
                            .setTitle('Report')
                            .setDescription(interaction.fields.getTextInputValue('description'))
                            .addFields(
                                {
                                    name: 'Absender',
                                    value: interaction.member?.toString() ?? "",
                                },
                                {
                                    name: 'Beschuldigt',
                                    value: (await interaction.guild?.members.fetch(result?.reported_id) || "<ERROR>").toString()
                                },
                                {
                                    name: 'Regel',
                                    value: result?.category ?? "<ERROR>"
                                },
                                {
                                    name: 'ID',
                                    value: result?.uuid ?? "<ERROR>"
                                },
                                {
                                    name: 'Status',
                                    value: 'Fertig'
                                },
                                {
                                    name: 'Verlinkte Nachricht',
                                    value: result?.message ?? "<NULL>"
                                }
                            )
                    ]
                })
            })


        }


    })

}
