import { CommandInteraction, Client, Interaction } from "discord.js";
import LogManager from "src/logger/logger";
import { codeblocks, metafrage } from "../action/infoMessages";

export default (client: Client, logger: LogManager): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction, logger);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction, logger: LogManager): Promise<void> => {
    // handle slash command here   
    switch (interaction.commandName) {
        case 'metafrage':
            metafrage(client, interaction, logger.logger('Metafrage'))
            return;
        case 'codeblocks':
            codeblocks(client, interaction, logger.logger('Codeblocks'))
            return;
    }

};