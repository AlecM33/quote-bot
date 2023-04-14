const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Information on the bot and how to use it.'),
    async execute (interaction, guildManager) {
        await interactionHandlers.helpHandler(interaction);
    }
};
