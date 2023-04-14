const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const responseMessages = require('./modules/response-messages.js');

const BOT = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

BOT.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    BOT.commands.set(command.data.name, command);
}

BOT.once('ready', () => {
    BOT.user.setActivity('profound quotes', { type: 'LISTENING' });
    console.log('Ready!');
});

BOT.login(process.env.TOKEN).then(() => {
    console.log('bot successfully logged in');
});

BOT.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = BOT.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, BOT.guilds);
    } catch (error) {
        console.error(error);
        if (interaction.deferred) {
            await interaction.followUp({ content: responseMessages.GENERIC_INTERACTION_ERROR, ephemeral: true });
        } else if (!interaction.replied) {
            await interaction.reply({ content: responseMessages.GENERIC_INTERACTION_ERROR, ephemeral: true });
        }
    }
});
