import {
  ButtonInteraction,
  CommandInteraction,
  StringSelectMenuInteraction,
  SlashCommandBuilder,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  ModalSubmitInteraction
} from 'discord.js'

export interface Command {
  init?: (client: any, logger: any) => void
  data: SlashCommandBuilder
  execute: (interaction: CommandInteraction) => Promise<void>
}

export function isCommand(object: any): object is Command {
  if (!('data' in object)) return false
  if (!('execute' in object)) return false
  if (typeof object.data !== 'object') return false
  if (!(object.data instanceof SlashCommandBuilder)) return false
  if (typeof object.execute !== 'function') return false
  return true
}

export interface Button {
  buttonId: string | RegExp
  execute: (interaction: ButtonInteraction) => Promise<void>
}

export function isButton(object: any): object is Button {
  if (!('buttonId' in object)) return false
  if (!('execute' in object)) return false
  if (typeof object.buttonId !== 'string' && !(object.buttonId instanceof RegExp)) return false
  if (typeof object.execute !== 'function') return false
  return true
}

export interface Menu {
  customId: string | RegExp
  execute: (interaction: StringSelectMenuInteraction) => Promise<void>
}

export function isMenu(object: any): object is Menu {
  if (!('customId' in object)) return false
  if (!('execute' in object)) return false
  if (typeof object.customId !== 'string' && !(object.customId instanceof RegExp)) return false
  if (typeof object.execute !== 'function') return false
  return true
}

export interface MessageContextMenu {
  data: ContextMenuCommandBuilder
  execute: (interaction: MessageContextMenuCommandInteraction) => Promise<void>
}

export function isMessageContextMenu(object: any): object is MessageContextMenu {
  if (!('data' in object)) return false
  if (!('execute' in object)) return false
  if (!(object.data instanceof ContextMenuCommandBuilder)) return false
  if (typeof object.execute !== 'function') return false
  return true
}

export interface UserContextMenu {
  data: ContextMenuCommandBuilder
  execute: (interaction: UserContextMenuCommandInteraction) => Promise<void>
}

export function isUserContextMenu(object: any): object is UserContextMenu {
  if (!('data' in object)) return false
  if (!('execute' in object)) return false
  if (!(object.data instanceof ContextMenuCommandBuilder)) return false
  if (typeof object.execute !== 'function') return false
  return true
}

export interface Modal {
  customId: string | RegExp
  execute: (interaction: ModalSubmitInteraction) => Promise<void>
}

export function isModal(object: any): object is Modal {
  if (!('customId' in object)) return false
  if (!('execute' in object)) return false
  if (typeof object.customId !== 'string' && !(object.customId instanceof RegExp)) return false
  if (typeof object.execute !== 'function') return false
  return true
}
