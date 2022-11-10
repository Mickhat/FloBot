import { Client } from 'discord.js';
import { LogManager } from '../logger/logger'

export default (client: Client, logger:LogManager): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return ;
            
        }

        logger.logSync("INFO", `${client.user.username}#${client.user.discriminator} ist online!`)
    })
    
}