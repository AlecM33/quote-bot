const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a new quote.')
        .addStringOption(option =>
            option.setName('quote')
                .setDescription('what was said')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('author')
                .setDescription('The person(s) who said it')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('The date the quote was said (MM/DD/YYYY or MM-DD-YYYY). Defaults to today.')
                .setRequired(false)),
    async execute (interaction, guildManager) {
        await interactionHandlers.addHandler(interaction);
    }
};
