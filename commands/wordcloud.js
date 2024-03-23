const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordcloud')
        .setDescription('Generate a colorful wordcloud from your server\'s quotes!')
        .addStringOption(option =>
            option.setName('author')
                .setDescription('Generate a wordcloud for a specific author.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('font')
                .setDescription('The font to use. Defaults to one of Georgia, Rockwell, Century Gothic, or Trebuchet MS.')
                .setRequired(false)),
    async execute (interaction, guildManager) {
        await interactionHandlers.wordcloudHandler(interaction);
    }
};
