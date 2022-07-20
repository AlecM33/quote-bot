const interactionHandlers = require("../modules/interaction-handlers.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('search for quotes.')
        .addStringOption(option =>
            option.setName('search_string')
                .setDescription('a keyword or keyphrase by which to search for quotes')
                .setRequired(true)),
    async execute (interaction) {
        await interactionHandlers.searchHandler(interaction);
    }
};
