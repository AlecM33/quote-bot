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
                .setDescription('specify whether to include the short, unique identifier for each quote in the search result.' +
                    ' This identifier can be used to delete a particular quote.')
                .setRequired(false)),
    async execute (interaction) {
        await interactionHandlers.searchHandler(interaction);
    }
};
