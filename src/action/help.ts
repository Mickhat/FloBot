import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder } from 'discord.js'

export async function helpIntroduction (interaction: CommandInteraction): Promise<void> {
  await interaction.reply({
    embeds: [
      new EmbedBuilder().setTitle('Hilfe-Seite')
        .setDescription('Hier ist die Hilfe-Seite.\n\n__**Inhalt**__')
        .addFields(
          { name: 'Informationen', value: 'Nachrichten, in denen Nutzer Informationen erhalten - Seite 2', inline: false },
          { name: 'Nutzer reporten', value: 'Nutzer, die gegen die Regeln dieses Servers verstoßen melden - Seite 3', inline: false },
          { name: 'Umfragen', value: 'Umfragen auf diesem Server - Seite 4', inline: false },
          { name: 'LaTeX', value: 'LaTeX Code in Nachrichten rendern', inline: false }
        )
        .setFooter({
          text: 'Seite 1/5'
        })
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Nächste Seite')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page2')
        )
    ],
    ephemeral: true
  })
}
export async function mainHelpPage (interaction: ButtonInteraction): Promise<void> {
  await interaction.update({
    embeds: [
      new EmbedBuilder().setTitle('Hilfe-Seite')
        .setDescription('Hier ist die Hilfe-Seite.\n\n__**Inhalt**__')
        .addFields(
          { name: 'Informationen', value: 'Nachrichten, in denen Nutzer Informationen erhalten - Seite 2', inline: false },
          { name: 'Nutzer reporten', value: 'Nutzer, die gegen die Regeln dieses Servers verstoßen melden - Seite 3', inline: false },
          { name: 'Umfragen', value: 'Umfragen auf diesem Server - Seite 4', inline: false },
          { name: 'LaTeX', value: 'LaTeX Code in Nachrichten rendern - Seite 5', inline: false }
        )
        .setFooter({
          text: 'Seite 1/5'
        })
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Nächste Seite')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page2')
        )
    ]
  })
}
export async function secondPage (interaction: ButtonInteraction): Promise<void> {
  await interaction.update({
    embeds: [
      new EmbedBuilder().setTitle('Informationen erhalten')
        .setDescription('Dieser Bot enthält Befehle, die nur eine Nachricht mit Informationen verschicken.')
        .addFields(
          { name: '/about', value: 'Dieser Befehl zeigt dir Informationen über diesen Bot an.', inline: false },
          { name: '/codeblocks', value: 'Diese Nachricht erklärt die Nutzung und Bedienung von Codeblocks.', inline: false },
          { name: '/help', value: 'Die Hilfe-Seite dieses Bots', inline: false },
          { name: '/metafrage', value: 'Diese Nachricht erklärt, was eine Metafrage ist und warum man sie nicht stellen sollte.', inline: false },
          { name: '/ping', value: 'Prüft, ob der Bot online ist', inline: false },
          { name: '/bj help', value: 'Einstieg in das CodingGame BlackJack', inline: false }
        )
        .setFooter({
          text: 'Seite 2/5'
        })
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Vorherige Seite')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page1'),
          new ButtonBuilder()
            .setLabel('Nächste Seite')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page3')
        )
    ]
  })
}
export async function thirdPage (interaction: ButtonInteraction): Promise<void> {
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
          text: 'Seite 3/5'
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
export async function fourthPage (interaction: ButtonInteraction): Promise<void> {
  await interaction.update({
    embeds: [
      new EmbedBuilder().setTitle('Umfragen')
        .setDescription('Umfragen sind etwas wertvolles, wenn man schnell möglichst viele Meinungen braucht. ' +
                'Um eine Umfrage zu erstellen, nutze **/voting**. Gebe dort nun deine Frage ein.\n' +
                'Anschließen musst du deine Antwortmöglichkeiten eingeben. Gebe diese mit Komata getrennt __ohne Leerzeichen__ nach dem Komma ein. Du kannst bis zu 6 Antwortmöglichkeiten eintragen')
        .setFooter({
          text: 'Seite 4/5'
        })
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Vorherige Seite')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page3'),
          new ButtonBuilder()
            .setLabel('Nächste Seite')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page5')
        )
    ]
  })
}
export async function fifthPage (interaction: ButtonInteraction): Promise<void> {
  await interaction.update({
    embeds: [
      new EmbedBuilder().setTitle('LaTeX')
        .setDescription('Wenn du mathematische Ausdrücke teilen möchtest, kann es sein, dass du mit LaTeX arbeiten möchtest' +
                '\n' +
                'Schreibe dazu in eine beliebige Nachricht deinen LaTeX Code zwischen zwei $$.' +
                'Alternativ kannst du den /tex command benutzen.')
        .setFooter({
          text: 'Seite 5/5'
        })
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Vorherige Seite')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page4')
        )
    ]
  })
}
