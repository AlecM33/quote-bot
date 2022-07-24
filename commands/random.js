const interactionHandlers = require('../modules/interaction-handlers');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('get a random quote, optionally filtering by author.')
        .addStringOption(option =>
            option.setName('author')
                .setDescription('The author by which to get a random quote.')
                .setRequired(false)),
    async execute (interaction) {
        await interactionHandlers.randomHandler(interaction);
    }
};
