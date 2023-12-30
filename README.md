# Moderation Bot in TypeScript using discordjs v14

This project was programmed by some members of Florian Dalwigk's community discord which unfortunately doesn't exist anymore. You can find the new Discord Server [here](https://discord.gg/65pXxkSE5g). The bot uses discordjs v14 and is written entirely in TypeScript. We also use a github workflow to automatically deploy the bot on our own server.

# Function overview

<div align="center">

| Command  |                         Function                          |
| :------: | :-------------------------------------------------------: |
|  /kick   |                       Kicks a user                        |
|   /ban   |                        Bans a user                        |
| /timeout |                      timeout a user                       |
|  /warn   |                       warns a user                        |
| /strike  |                      strikes a user                       |
|  /about  |                         about me                          |
|  /help   |           shows a multi page information widget           |
| /bj help | shows the help information for the BlackJack sub commands |

</div>

# Development

To setup your bot, you have to copy the `env.example` to `.env` and set your TOKENs and IDs:

```INI
BOT_TOKEN=YOURTOKEN
APPLICATION_ID=YOUR_APPLICATION_ID
TOGGLE_ROLES= <ids von rollen, die sich Nutzer selbst geben können. Mit, getrennt. Maximal 5 (weil man nicht mehr buttons in eine Nachricht machen kann)>
DB_PATH=<path to sqlite3 db>
REPORT_CHANNEL_ID= <channel, in den Reports geschickt werden sollen>
TICKET_SUPPORTER= <id der Rolle, die jedem Ticket hinzugefügt wird>
```

You can also configure the logging behavior in `logging.json`.

## npm commands

The bot is tested with Node Version 18.x

```bash
npm ci # to install dependencies
npm run lint # this runs the code linter
npm test # this executes the jest unit tests
npm run dev # this starts the bot with nodemon
npm run start # this starts the bot as in production
```
