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
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('include_identifier')
                .setDescription('include the unique identifier for each resulting quote, which can be used to delete that quote.')
                .setRequired(false)),
    async execute (interaction, guildManager) {
        await interactionHandlers.searchHandler(interaction);
    }
};
