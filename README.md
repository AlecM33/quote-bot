# quote-bot
A discord bot for saving and displaying memorable quotes from you and your friends.

![image](https://user-images.githubusercontent.com/24642328/179651423-3e55ca4c-92ec-4564-929e-0b154670aa83.png)

![image](https://user-images.githubusercontent.com/24642328/179873365-880df3d1-7259-4ca5-88b0-61f0894a7053.png)

# Features

Don't you wish you could quickly immortalize the great things your friends say in your discord server? This bot allows you to save quotes and later have them quoted back to you.

- save quotes by any number of specified authors
- pull random quotes by any author
- search for quotes that match a keyphrase
- get statistics including who has said how many quotes
- more coming soon...

# Tech Stack

The bot is written in javascript and makes heavy use of [discord.js](https://discord.js.org/#/), which is a wrapper around the Discord API (view the [developer documentation](https://discord.com/developers/docs/intro)).

I currently host the bot using the [Heroku Cloud Platform](https://heroku.com), and use a free add-on to provision a [PostgreSQL database](https://www.postgresql.org/), where I store the quotes for the single server where the bot operates. 

# Database Schema

The database has one table:

```
CREATE TABLE quotes (
    quotation citext NOT NULL,
    author character varying(64) NOT NULL,
    saidat date NOT NULL,
    CONSTRAINT quotes_pkey PRIMARY KEY (quotation, author)
);
```

documentation for the "citext" datatype for PostgreSQL 14: https://www.postgresql.org/docs/current/citext.html


