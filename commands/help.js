const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('information on the bot and how to use it'),
    async execute (interaction) {
        await interactionHandlers.helpHandler(interaction);
    }
};
