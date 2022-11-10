import {
    SelectMenuInteraction, Client,
    ModalBuilder, ActionRowBuilder,
    TextInputBuilder, TextInputStyle,
    EmbedBuilder
} from "discord.js"
import { Database } from "sqlite3"
import { Logger } from "../logger/logger"

export default async (interaction: SelectMenuInteraction, client: Client, db: Database, logger: Logger) => {


    let uuid = interaction.customId.split('_')[1]
    logger.logSync("DEBUG", `User-Report ${uuid} continue`)

    db.all(`SELECT uuid, reported_id, status, category FROM reports WHERE uuid = ?`, [uuid], (err, result) => {
        logger.logSync("DEBUG", `Daten von sqlite erhalten. Ergebniss: ${JSON.stringify(result)} Fehler: ${err ? "ja" : "nein"}`)
        if (err) return interaction.reply({
            content: "ID existiert nicht. Bitte mache den Report von neu.",
            embeds: [
                new EmbedBuilder().setDescription(JSON.stringify(err, undefined, 2))
            ],
            ephemeral: true
        })
        if (result) {
            logger.logSync("DEBUG", "Update daten")
            db.run(`UPDATE reports SET category = ? WHERE uuid = ?`, [
                interaction.values[0], uuid
            ])

            logger.logSync("DEBUG", "Zeige modal")
            interaction.showModal(new ModalBuilder()
                .setTitle('Report absenden')
                .setCustomId(`report_${uuid}_finish`)
                .setComponents(
                    new ActionRowBuilder<TextInputBuilder>().setComponents(
                        new TextInputBuilder()
                            .setLabel('Beschreibe bitte den Verstoß möglichst genau:')
                            .setRequired(true)
                            .setPlaceholder('Person war sehr böse')
                            .setStyle(TextInputStyle.Paragraph)
                            .setCustomId('description')
                    )
                )
            )

        }
        else {
            interaction.reply("Fehler in der Datenbank, kein Ergebniss gefunden.")
        }
    })


}
