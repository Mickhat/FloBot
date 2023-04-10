import { AttachmentBuilder, Message, EmbedBuilder, CommandInteraction, ChannelType, PartialMessage } from 'discord.js'
import mj, { TypesetOptions, TypesetResult } from 'mathjax-node'

import { svg2png } from 'svg-png-converter'

mj.start()

async function render (latex: string): Promise<TypesetResult> {
  const options: TypesetOptions = {
    math: latex,
    format: 'TeX',
    svg: true,
    ex: 6,
    width: 1_000,
    linebreaks: true
  }
  const result = await mj.typeset(options)
  return result
}

async function renderNewLatexMessage (message: Message): Promise<void> {
  if (message.content == null || message.content === "") {
    return
  }

  if (!message.content.includes('$$')) {
    return
  }

  if ((message.content.match(/\$\$/g) ?? []).length % 2 !== 0) {
    await message.reply({ content: "Anzahl an $$ muss gerade sein." })
    return
  }

  let { content } = message

  content = content.replace(/ö/g, 'oe')
  content = content.replace(/ä/g, 'ae')
  content = content.replace(/ü/g, 'ue')
  content = content.replace(/ß/g, 'ss')

  const parts = content.split('$$')

  try {
    const texParts = parts.map((value: string, index: number) => {
      if (value.trim() === '') {
        return ""
      }

      if (index % 2 === 0) {
        value = value.replace(/\{|\}/g, '')
        return `\\text{${value}}`
      }

      return value
    })

    const texString = texParts.join('')

    const result = await render(texString)

    if (result.error != null || !result.svg) {
      await message.reply({
        content: result.error?.message ?? "kein Plan warum, da ist ein Fehler."
      })
      return
    }

    let { svg } = result
    svg = svg.replace(/<path/g, '<path stroke="#FFF" fill="#FFF" style="stroke: #FFF; fill: #FFF; color: #FFF;"')
    svg = svg.replace(/<rect stroke="none"/g, '<rect stroke="#FFF" fill="#FFF" style="stroke: #FFF; fill: #FFF; color: #FFF;"')

    const png = await svg2png({
      input: svg,
      encoding: 'buffer',
      format: 'png'
    })

    await message.reply({
      files: [
        new AttachmentBuilder(png)
          .setName('rendered-message.png')
      ],
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() ?? undefined })
          .setImage('attachment://rendered-message.png')
      ]
    })
  } catch (e) {
    try {
      await message.reply({ content: JSON.stringify(e, null, 2) })
    } catch (e2) {
      console.error(e, e2)
    }
  }
}

async function editMessage (old: Message | PartialMessage, message: Message | PartialMessage): Promise<void> {
  try {
    if (!old?.content?.includes('$$')) {
      return
    }

    const channel = message.channel

    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.PublicThread && channel.type !== ChannelType.PrivateThread) {
      return
    }

    const originalResponse = (await channel.messages.fetch({
      after: old.id,
      limit: 3
    })).filter(msg => {
      if (msg.author.id !== msg.client.user.id) return false
      if (msg.reference == null) return false
      if (msg.reference.messageId === old.id) return true
      return false
    }).first()

    if (!originalResponse?.editable || !originalResponse.deletable) {
      return
    }

    if (message.content == null || message.content === "") {
      return
    }

    if (!message.content.includes('$$')) {
      await originalResponse.delete()
    }

    if ((message.content.match(/\$\$/g) ?? []).length % 2 !== 0) {
      await message.reply({ content: "Anzahl an $$ muss gerade sein." })
      return
    }

    let { content } = message

    content = content.replace(/ö/g, 'oe')
    content = content.replace(/ä/g, 'ae')
    content = content.replace(/ü/g, 'ue')
    content = content.replace(/ß/g, 'ss')

    const parts = content.split('$$')

    const texParts = parts.map((value: string, index: number) => {
      if (value.trim() === '') {
        return ""
      }

      if (index % 2 === 0) {
        value = value.replace(/\{|\}/g, '')
        return `\\text{${value}}`
      }

      return value
    })

    const texString = texParts.join('')

    const result = await render(texString)

    if (result.error != null || !result.svg) {
      await originalResponse.edit({
        content: result.error?.message ?? "kein Plan warum, da ist ein Fehler."
      })
      return
    }

    let { svg } = result
    svg = svg.replace(/<path/g, '<path stroke="#FFF" fill="#FFF" style="stroke: #FFF; fill: #FFF; color: #FFF;"')
    svg = svg.replace(/<rect stroke="none"/g, '<rect stroke="#FFF" fill="#FFF" style="stroke: #FFF; fill: #FFF; color: #FFF;"')

    const png = await svg2png({
      input: svg,
      encoding: 'buffer',
      format: 'png'
    })

    await originalResponse.edit({
      files: [
        new AttachmentBuilder(png)
          .setName('rendered-message.png')
      ],
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: message.author?.username ?? "k.p.", iconURL: message.author?.avatarURL() ?? undefined })
          .setImage('attachment://rendered-message.png')
      ]
    })
  } catch (e) {
    try {
      await message.reply({ content: JSON.stringify(e, null, 2) })
    } catch (e2) {
      console.error(e, e2)
    }
  }
}

async function renderSlashCommand (command: CommandInteraction): Promise<void> {
  try {
    await command.deferReply()
    const tex = command.options.get('tex', true).value?.toString()
    if (!tex) {
      await command.reply("No tex")
      return
    }
    const result = await render(tex)
    if (result.error != null || !result.svg) {
      await command.reply({
        content: result.error?.message ?? "kein Plan warum, da ist ein Fehler."
      })
      return
    }
    let { svg } = result
    svg = svg.replace(/<path/g, '<path stroke="#FFF" fill="#FFF" style="stroke: #FFF; fill: #FFF; color: #FFF;"')
    svg = svg.replace(/<rect stroke="none"/g, '<rect stroke="#FFF" fill="#FFF" style="stroke: #FFF; fill: #FFF; color: #FFF;"')

    const png = await svg2png({
      input: svg,
      encoding: 'buffer',
      format: 'png'
    })

    await command.followUp({
      files: [
        new AttachmentBuilder(png)
          .setName('rendered-message.png')
      ],
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: command.user.username, iconURL: command.user.avatarURL() ?? undefined })
          .setImage('attachment://rendered-message.png')
      ]
    })
  } catch (e) {
    try {
      await command.followUp({ content: JSON.stringify(e, null, 2), ephemeral: true })
    } catch (e2) {
      console.error(e, e2)
    }
  }
}

export { renderNewLatexMessage, renderSlashCommand, editMessage }
