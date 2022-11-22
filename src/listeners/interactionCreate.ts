import {
    CommandInteraction, Client, Interaction,
    ButtonInteraction, ApplicationCommandType, UserContextMenuCommandInteraction,
    ModalSubmitInteraction, SelectMenuInteraction, MessageContextMenuCommandInteraction,
    InteractionType, ChannelType, GuildBasedChannel,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    AutocompleteInteraction
} from "discord.js";
import LogManager from "../logger/logger";
import { codeblocks, metafrage, about, ping } from "../action/infoMessages";
import { createRoleInterface } from '../action/roles_buttons_create'
import { toggleRoles } from "../action/toggleRole";
import startUserReport from "../action/userReport"
import { Database } from 'sqlite3'

import continueReport from "../action/continueReport";
import finishReport from "../action/finishReport";
import messageReport from "../action/messageReport";
import voting from "../action/voting";
import { fourthPage, helpIntroduction, mainHelpPage, secondPage, thirdPage } from "../action/help";
import { createTicket, ticketAdd, ticketClose } from "../action/ticket-system";
import { meme }  from "../action/meme";
import kick from "../action/kick";
import timeout from "../action/timeout";
// import { autocomplete } from "../action/youtube";

export default (client: Client, logger: LogManager, db: Database): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            handleSlashCommand(client, interaction, logger);
        }
        if (interaction.isButton()) {
            handleButtonInteraction(client, interaction, logger)
        }
        if (interaction.isContextMenuCommand() && interaction.commandType == ApplicationCommandType.User) {
            handleUserContextMenuCommand(client, interaction, logger, db)
        }
        if (interaction.isContextMenuCommand() && interaction.commandType == ApplicationCommandType.Message) {
            handleMessageContextMenuCommand(client, interaction, logger, db)
        }
        if (interaction.isSelectMenu()) {
            handleSelectMenu(client, interaction, logger, db)
        }
        if (interaction.isModalSubmit()) {
            handleModalSubmit(client, interaction, logger, db)
        }
        if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
            handleAutoComplete(client, interaction, logger, db)
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction, logger: LogManager) => {
    let channel: GuildBasedChannel | null;
    // handle slash command here
    switch (interaction.commandName) {
        case 'metafrage':
            metafrage(client, interaction, logger.logger('Metafrage'))
            return;
        case 'codeblocks':
            codeblocks(client, interaction, logger.logger('Codeblocks'))
            return;
        case 'role':
            createRoleInterface(interaction, "once", logger.logger('Toogle-Roles'))
            return;
        case 'role-force-button':
            createRoleInterface(interaction, "global", logger.logger('Toggle-Roles'))
            return;
        case 'about':
            about(client, interaction, logger.logger('About'))
            return;
        case 'voting':
            voting(client, interaction);
            return;
        case 'help':
            helpIntroduction(interaction)
            return;
        case 'voting':
            voting(client, interaction);
            return;
        case 'ping':
            ping(client, interaction, logger.logger('Ping'));
            return;
        case 'meme':
            meme(client, interaction, logger.logger('meme'));
            return;
         case 'kick':
            kick(client, interaction, logger.logger('kick'));
            return;
        case 'timeout':
            timeout(client, interaction, logger.logger('timeout'));
            return;
        case 'ticket-create':
            if (!interaction.guild || !interaction.member || !interaction.member.user.id) {
                interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
                return;
            }
            console.log(interaction.member.user.id)
            let result = await createTicket(client, interaction.guild, interaction.member.user.id, logger.logger('ticket-system'))
            if (typeof result == 'string') {
                interaction.reply({ content: 'Ticket konnte nicht erstellt werden.', ephemeral: true })
                return;
            }
            interaction.reply({ content: `Ticket erstellt. <#${result.id}>`, ephemeral: true })
            return;
        case 'ticket-add':
            if (!interaction.guild || !interaction.member || !interaction.member.user.id) {
                interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
                return;
            }
            channel = await interaction.guild.channels.fetch(interaction.channelId)
            if (!channel || !/ticket-[0-9]{4}/.test(channel?.name || "")) {
                interaction.reply({
                    content: 'Du kannst den Befehl nur in Tickets nutzen',
                    ephemeral: true
                })
                return;
            }

            if (channel.type != ChannelType.GuildText) return;
            ticketAdd(interaction.options?.get('target')?.value?.toString() ?? interaction.member.user.id, channel)
            interaction.reply({
                content: 'Fertig!',
                ephemeral: true,
            })
            return;
        case 'ticket-close':
            if (!interaction.guild || !interaction.member || !interaction.member.user.id) {
                interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
                return;
            }
            channel = await interaction.guild.channels.fetch(interaction.channelId)
            if (!channel || !/ticket-[0-9]{4}/.test(channel?.name || "")) {
                interaction.reply({
                    content: 'Du kannst den Befehl nur in Tickets nutzen',
                    ephemeral: true
                })
                return;
            }

            if (channel.type != ChannelType.GuildText) return;
            ticketClose(channel)
            interaction.reply({
                content: 'Fertig!',
                ephemeral: true,
            })
            return;
    }

};

const handleButtonInteraction = async (client: Client, interaction: ButtonInteraction, logger: LogManager) => {
    if (/(addRole-|removeRole-)([0-9]+)/.test(interaction.customId)) {
        toggleRoles(client, interaction, logger.logger("Toggle-Roles"))
    }
    if (interaction.customId == 'help-page1') {
        mainHelpPage(interaction)
    }
    if (interaction.customId == 'help-page2') {
        secondPage(interaction)
    }
    if (interaction.customId == 'help-page3') {
        thirdPage(interaction)
    }
    if (interaction.customId == 'help-page4') {
        fourthPage(interaction)
    }
    if (interaction.customId == 'ticket-delete') {
        interaction.reply({
            content: 'Lösche Ticket',
            ephemeral: true,
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Bestätigen')
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId('ticket-delete-confirm')
                    )
            ]
        })

    }
    if (interaction.customId == 'ticket-delete-confirm') {
        interaction.message.channel.delete()
    }
    if (interaction.customId == 'delete') {
        interaction.message.delete()
    }

};

const handleUserContextMenuCommand = async (client: Client, interaction: UserContextMenuCommandInteraction, logger: LogManager, db: Database) => {
    if (interaction.commandType == ApplicationCommandType.User && interaction.commandName == "REPORT") {
        startUserReport(interaction, client, db, logger.logger("Report-System"))
    }
}

const handleMessageContextMenuCommand = async (client: Client, interaction: MessageContextMenuCommandInteraction, logger: LogManager, db: Database) => {
    if (interaction.commandType == ApplicationCommandType.Message && interaction.commandName == "REPORT") {
        messageReport(interaction, client, db, logger.logger("Report-System"))
    }
}

const handleSelectMenu = async (client: Client, interaction: SelectMenuInteraction, logger: LogManager, db: Database) => {
    if (/report_.+_category/.test(interaction.customId)) {
        continueReport(interaction, client, db, logger.logger("Report"))
    }
}

const handleModalSubmit = async (client: Client, interaction: ModalSubmitInteraction, logger: LogManager, db: Database) => {
    if (/report_.+_finish/.test(interaction.customId)) {
        finishReport(interaction, client, db, logger.logger('Report'))
    }
}

const handleAutoComplete = async (client: Client, interaction: AutocompleteInteraction, logger: LogManager, db: Database) => {
    // autocomplete(client, interaction, db, logger.logger('yt-autocomplete'))
}