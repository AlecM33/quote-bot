const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('search for quotes.')
        .addStringOption(option =>
            option.setName('search_string')
                .setDescription('a keyword or keyphrase by which to search for quotes')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('include_identifier')
                .setDescription('include the unique identifier for each resulting quote, which can be used to delete that quote.')
                .setRequired(false)),
    async execute (interaction) {
        await interactionHandlers.searchHandler(interaction);
    }
};
