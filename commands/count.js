const { fetchQuoteCount, fetchQuoteCountByAuthor } = require('../database/client.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription('get the total number of quotes saved, optionally filtering by author.')
        .addStringOption(option =>
            option.setName('author')
                .setDescription('the author by which to get the number of quotes')
                .setRequired(false)),
    async execute(interaction) {
        let author = interaction.options.getString('author')?.trim().toLowerCase();
        try  {
            let queryResult = author ? await fetchQuoteCountByAuthor(author) : await fetchQuoteCount();
            if (queryResult.length > 0) {
                if (author) {
                    let capitalizedAuthor = author.charAt(0).toUpperCase() + author.slice(1);
                    await interaction.reply("**" + capitalizedAuthor + "** has said **" + queryResult[0].count + "** quotes.");
                } else {
                    await interaction.reply("There are **" + queryResult[0].count + "** quotes.");
                }
            } else {
                await interaction.reply("There are no quotes!");
            }
        } catch (e) {
            await interaction.reply('There was a problem getting a random quote. Please try again later');
        }
    },
};
