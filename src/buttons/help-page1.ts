import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js'

export default {
  buttonId: /help-page1/,
  async execute(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('Hilfe-Seite')
          .setDescription('Hier ist die Hilfe-Seite.\n\n__**Inhalt**__')
          .addFields(
            {
              name: 'Informationen',
              value: 'Nachrichten, in denen Nutzer Informationen erhalten - Seite 2',
              inline: false
            },
            {
              name: 'Nutzer reporten',
              value: 'Nutzer, die gegen die Regeln dieses Servers verstoßen melden - Seite 3',
              inline: false
            },
            { name: 'Umfragen', value: 'Umfragen auf diesem Server - Seite 4', inline: false }
          )
          .setFooter({
            text: 'Seite 1/4'
          })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('Nächste Seite')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page2')
        )
      ]
    })
  }
}
