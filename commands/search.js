const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for quotes.')
        .addStringOption(option =>
            option.setName('search_string')
                .setDescription('a keyword or keyphrase')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('author')
                .setDescription('narrow your search by a given author')
                .setRequired(false)),
    async execute (interaction, guildManager) {
        await interactionHandlers.searchHandler(interaction);
    }
};
