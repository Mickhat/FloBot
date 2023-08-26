import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js"

export default {
  buttonId: /help-page3/,
  async execute (interaction: ButtonInteraction): Promise<void> {
    await interaction.update({
      embeds: [
        new EmbedBuilder().setTitle('Nutzer melden')
          .setDescription('Dieser Bot enthält ein Melde-System. Dieses soll garantieren, dass Moderatoren schnell mitbekommen, wenn auf dem Server etwas passiert, was nicht in Ordnung ist. ' +
            'Bist du der Meinung, dass etwas gegen unsere Regeln verstößt, kannst du die Nachricht rechtsklicken. Anschließen wählst du Apps > REPORT aus. ' +
            'Gebe uns hier bitte noch ein paar Details. Was hat der Nutzer gemacht? Wähle erst die Kategorie aus und beschreibe dann den Vorfall kurz. ' +
            'Bitte bewahre in jedem Fall Screenshots __vom ganzen Bildschirm__ auf. Wenn wir uns unsicher sind, ob dein Report der Richtigkeit entspricht, werden ' +
            'wir darauf zurückgreifen.\n' +
            'Bezieht sich der Report nicht auf eine konkrete Nachricht des Nutzers, kannst du auch den Nutzer melden. Suche ihn dafür in der Nutzer-Liste, drücke Rechtsklick > Apps > REPORT ' +
            'Auch hier sind Beweise über den Vorfall von Vorteil. Sind wir uns unsicher, werden wir bei dir noch nachfragen.')
          .setFooter({
            text: 'Seite 3/4'
          })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Vorherige Seite')
              .setEmoji('◀️')
              .setStyle(ButtonStyle.Primary)
              .setCustomId('help-page2'),
            new ButtonBuilder()
              .setLabel('Nächste Seite')
              .setEmoji('▶️')
              .setStyle(ButtonStyle.Primary)
              .setCustomId('help-page4')
          )
      ]
    })
  }
}
