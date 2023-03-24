const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('download')
        .setDescription('Receive a text file containing all your server\'s quotes.'),
    async execute (interaction) {
        await interactionHandlers.downloadHandler(interaction);
    }
};
