const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordcloud')
        .setDescription('Generate a colorful wordcloud from your server\'s quotes!')
        .addStringOption(option =>
            option.setName('author')
                .setDescription('Generate a wordcloud from a specific author')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('font')
                .setDescription('The font to use. Defaults to "Georgia"')
                .setRequired(false)),
    async execute (interaction, guildManager) {
        await interactionHandlers.wordcloudHandler(interaction);
    }
};
