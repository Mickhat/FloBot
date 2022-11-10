import { Client, CommandInteraction } from 'discord.js'
import { Logger } from 'src/logger/logger'
import { EmbedBuilder } from 'discord.js';

export async function metafrage(client: Client, interaction: CommandInteraction, logger: Logger) {

    if (!interaction.isRepliable() || !interaction.reply) {
        logger.logSync("ERROR", "Gegebene interaction kann nicht beantwortet werden.")
        return;
    }

    interaction.reply({
        content: `**Metafragen** sind Fragen, welche oft vor einer richtigen Frage gestellt werden.
Klassische Beispiele für Metafragen sind:
- Kann mit jemand mit JavaScript helfen?
- Wer kennt sich mit IP-Adressen aus?
Solche Fragen verhindern eine schnelle Antwort auf die eigentliche Frage. Oft denkt jemand nicht, im Fachgebiet "gut genug" zu sein, kennt aber die Antwort und könnte trotzdem nicht antworten. Auch wenn sich jemand meldet, muss er erst auf die Antwort des Fragestellers warten, bis er antworten kann.
__Stelle deine Frage direkt, ohne erstmal nach einem Experten zu suchen. Dies erspart dir Zeit und erhöht die Chance auf eine Antwort.__
[mehr Informationen](http://metafrage.de/)`,
    }).then(() => {
        logger.logSync("INFO", "Metafragen-Info gesendet.")
    }).catch(() => {
        logger.logSync("ERROR", "Metafragen-Info konnte nicht gesendet werden.")
    })

}
export async function codeblocks(client: Client, interaction: CommandInteraction, logger: Logger) {

    if (!interaction.isRepliable() || !interaction.reply) {
        logger.logSync("ERROR", "Gegebene interaction kann nicht beantwortet werden.")
        return;
    }

    interaction.reply({
        content: `**Codeblocks** sind in discord-Nachrichten integrierbare Blöcke, die Quellcode enthalten. Sie sehen so aus:
\`\`\`py
print("Hello World")
\`\`\`
Du erstellst sie mit drei \\\` vor deinem Code und drei \\\` nach deinem Code. Um das Syntax-Highlighting zu aktivieren, kannst du nach den ersten drei \\\` die Sprache dazuschreiben.
Der Codeblock von oben sieht so aus:
\\\`\\\`\\\`py
print("Hello World")
\\\`\\\`\\\`
Dadurch machst du deinen Code, im Vergleich zu normalem Text, besser lesbar für alle und kannst schneller eine Antwort auf deine Frage bekommen. Auch sind sie, im Vergleich zu Screenshots, sehr Datensparsam.
Codeblocks sind die beste Art, Code auf Discord zu teilen, und alle werden dir Dankbar sein, wenn du sie nutzt.
`,
    }).then(() => {
        logger.logSync("INFO", "Codeblock-Info gesendet.")
    }).catch(() => {
        logger.logSync("ERROR", "Codeblock-Info konnte nicht gesendet werden.")
    })

}


export async function about(client: Client, interaction: CommandInteraction, logger: Logger) {

    if (!interaction.isRepliable() || !interaction.reply) {
        logger.logSync("ERROR", "Gegebene interaction kann nicht beantwortet werden.")
        return;
    }

    let exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Über mich')
	.setAuthor({ name: 'Moderation Bot', url: 'https://discord.js.org' })
	.setDescription('Wer mich entwickelt hat')
	// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
	.setTimestamp()
	.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    await interaction.reply({ 
        embeds: [exampleEmbed]
    }).then(() => {
        logger.logSync("INFO", "About-info gesendet.")
    }).catch(() => {
        logger.logSync("ERROR", "About-Info konnte nicht gesendet werden.")
    })
}
