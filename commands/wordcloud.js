const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordcloud')
        .setDescription('Generate a colorful wordcloud from your server\'s quotes!')
        .addIntegerOption(option =>
            option.setName('size')
                .setDescription('Size of the wordcloud - 1 (small), 2 (medium), or 3 (large)')
                .setMinValue(1)
                .setMaxValue(3)
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('author')
                .setDescription('Generate a wordcloud from a specific author')
                .setRequired(false)),
    async execute (interaction) {
        await interactionHandlers.wordcloudHandler(interaction);
    }
};
