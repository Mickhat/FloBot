import { Client, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js"
import ms from "ms"
import { AsyncDatabase } from "src/sqlite/sqlite"

export async function createGiveaway (client: Client, interaction: CommandInteraction, db: AsyncDatabase): Promise<void> {
  const giveawayBy = interaction.member as GuildMember
  const giveawayTime = ms(interaction.options.get('time', false)?.value?.toString() ?? '24h') || ms('24h')
  const giveawayItem = interaction.options.get('item', true).value?.toString() ?? 'nothing'
  const timestap = Math.floor((new Date().getTime() + giveawayTime) / 1000)
  await interaction.reply({
    content: 'Giveaway Vorschau. Das System ist nicht aktiv.',
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: giveawayBy.displayName, iconURL: giveawayBy.avatarURL() ?? undefined })
        .setTitle('Neues Giveaway')
        .addFields(
          { name: 'Gewinn:', value: giveawayItem },
          { name: 'Endet:', value: `<t:${timestap}:R> <t:${timestap}:d> <t:${timestap}:T>` }
        )
        .setFooter({ iconURL: client.user?.avatarURL() ?? undefined, text: 'FloBot' })
        .setTimestamp(timestap)
    ]
  })
}
