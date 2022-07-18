const { addQuote } = require('../database/client.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { response } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('add a new quote.')
        .addStringOption(option =>
            option.setName('author')
                .setDescription('The person(s) who said this quote')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('quote')
                .setDescription('what was said')
                .setRequired(true)),
    async execute(interaction) {
        const author = interaction.options.getString('author').trim().toLowerCase();
        const quote = interaction.options.getString('author').trim().toLowerCase();
        await addQuote(quote, author).catch (async (e) => {
            if (e.includes("duplicate key")) {
                await interaction.reply(response.DUPLICATE_QUOTE);
            } else {
                await interaction.reply(response.GENERIC_ERROR);
            }
        });

        if (!interaction.replied) {
            await interaction.reply(response.SUCCESS);
        }
    },
};
