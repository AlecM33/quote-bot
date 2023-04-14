const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('authors')
        .setDescription('Get a sorted list of unique authors of saved quotes.'),
    async execute (interaction, guildManager) {
        await interactionHandlers.authorsHandler(interaction);
    }
};
