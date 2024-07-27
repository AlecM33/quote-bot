const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete quotes that match your search.')
        .addStringOption(option =>
            option.setName('search_string')
                .setDescription('a keyword or keyphrase')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('author')
                .setDescription('narrow your options by an author')
                .setRequired(false)),
    async execute (interaction, guildManager) {
        await interactionHandlers.deleteHandler(interaction);
    }
};
