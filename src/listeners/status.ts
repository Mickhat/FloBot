import { Client } from 'discord.js';
import { LogManager } from '../logger/logger'

export default (client: Client, logger: LogManager): void => {
    client.on('ready', async () => {
        client.user?.setPresence({
            activities: [{
                name: "/help",
                type: 0 // type 0 is Game 
                // You can find more information here: 
                //https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
            }],
            status: 'dnd'
        });
        logger.logSync("INFO", "Status wurde gesetzt.")
    })
};
