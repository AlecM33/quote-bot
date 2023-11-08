const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updates')
        .setDescription('Get the latest info on changes to the bot.'),
    async execute (interaction, guildManager) {
        await interactionHandlers.updatesHandler(interaction);
    }
};
