# quote-bot

<span>
    <img src='./servers-badge.svg'/>
    <img src='./quotes-stored-badge.svg'/>
</span>
<br><br>
A discord bot for saving and displaying memorable quotes from your friends.
<br>

### Add this bot to your server via top.gg: https://top.gg/bot/777314683333771285, or read below for how to set up your own instance. 

`/add` - add a quote by a specified author.<br>
`/random` - display a random quote, optionally by author.<br>
`/search` - search for quotes by a string of text. You can also choose to include a quote's numerical identifier in the search results, which can be used to delete the quote.<br>
`/delete` - delete a quote by its numerical identifier. The identifier is obtained using the "search" command and supplying the "include_identifier" parameter as "True".<br>
`/download` - (response visible to only the sender) receive a text file containing all your server's quotes.<br>
`/wordcloud` - Generate a colorful cloud of words from the quotes said in your server! The size of a word is proportional to how often it's been said.<br>
`/count` - get the number of quotes saved, optionally by author.<br>
`/help` - (response visible to only the sender) info on the bot and how to use it, the privacy policy, and support resources.

![image](https://user-images.githubusercontent.com/24642328/179651423-3e55ca4c-92ec-4564-929e-0b154670aa83.png)

<img src='https://user-images.githubusercontent.com/24642328/227757021-ada37249-8e6d-41fa-86a7-529d907e6295.png' width=650/>

# Tech Stack

The bot is written in javascript and makes heavy use of [discord.js](https://discord.js.org/#/), which is a wrapper around the Discord API (view the [developer documentation](https://discord.com/developers/docs/intro)).

I currently host the bot using the [Heroku Cloud Platform](https://heroku.com). The bot speaks to a PostgreSQL instance hosted for free on [ElephantSQL](https://www.elephantsql.com/), where I store quotes from the few servers where the bot operates. The bot's connection to the database is SSL-enabled. The "quotation" column is encrypted.

# Running your own instance of the bot

Stored quotes are associated with a specific guild, so you can safely add the same instance of the bot to multiple servers. 

For the bot to run, you need to populate 4 environment variables referenced within the code. These are `process.env.CLIENT_ID`, `process.env.DATABASE_URL`, `process.env.TOKEN`, and `process.env.ENCRYPTION_KEY`. Read below for how to obtain these.

1. You'll need to [create a discord application through the developer portal](https://discord.com/developers/applications). Your application will be assigned an "Application ID" (aka client id), which can be referenced in the "General Information" section. This will be the value of `process.env.CLIENT_ID`. 

2. Within that application, you'll need to add a bot. Within the "Bot" section of the application, you'll see the option to generate a token. This is the authentication token for your bot (and is thus very sensitive data). This will be the value of `process.env.TOKEN`.
<br>
<div align=center>
    <img width=200 src='https://user-images.githubusercontent.com/24642328/180114024-937fa9ba-9cd5-40ea-ac87-8d5e6b2e1043.png'/>
</div>

3. You will need an instance of a PostgreSQL database, preferably version 14 to ensure compatibility with the "citext" extension - see "Database Schema" below. `process.env.DATABASE_URL` will need to be the value of the connection string for this database. That connection string will be structured like so:

    `postgres://your-username:your-password@your-host:your-port/your-database-name`. 
    
4. You'll need to populate the database with the appropriate schema. See the "Database Schema" section. 

5. You'll need to set `process.env.ENCRYPTION_KEY` to a very strong password. This is used to encrypt several columns.
    
5. You'll need to add the bot to your desired server. Within the "Bot" section of your Discord application, you can create a permissions integer that will be added to the OAuth link for a given bot. I recommend, at minimum, the "Send Messages", "Send Messages in Threads", and "Use Slash Commands" permissions, which produce integer `277025392640`. The link to add the bot would then be the following, with your application ID substituted in:

    `https://discord.com/oauth2/authorize?client_id=your-application-id&permissions=277025392640&scope=bot`
    
6. Lastly, run the bot on your chosen server with `npm start`. The bot should log in, and within the server you should see it's slash commands available by simply typing `/`. 

# Database Schema

see `database/schema.sql`.

documentation for the "citext" datatype for PostgreSQL 14: https://www.postgresql.org/docs/current/citext.html


