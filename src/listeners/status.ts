import { Client } from 'discord.js';

export default (client: Client): void  => {
    client.on('ready', async () => {
        client.user?.setPresence({
            activities: [{
            name: "Testing",
            type: 0 // type 0 is Game 
            // You can find more information here: 
            //https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
        }],
        status: 'dnd'
    }
        );
})};
