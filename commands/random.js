const { fetchAllQuotes, getQuotesFromAuthor } = require('../database/client.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('get a random quote, narrowing by author if desired.')
        .addStringOption(option =>
            option.setName('author')
                .setDescription('The author by which to get a random quote.')
                .setRequired(false)),
    async execute(interaction) {
        let author = interaction.options.getString('author')?.trim().toLowerCase();
        try  {
            let queryResult = author ? await getQuotesFromAuthor(author) : await fetchAllQuotes();
            if (queryResult.length > 0) {
                let randomQuote = queryResult[getRandomInt(0, queryResult.length)];
                let capitalizedAuthor = randomQuote.author.charAt(0).toUpperCase() + randomQuote.author.slice(1);
                let d = new Date(randomQuote.saidat);
                let year = d.getFullYear().toString().slice(2);
                await interaction.reply("_\"" + randomQuote.quotation + "\"_ - " + capitalizedAuthor + " (" + (d.getMonth() + 1) + "/" + d.getDate() + "/" + year + ")");
            } else {
                await interaction.reply("There are no quotes stored by that author!");
            }
        } catch (e) {
            await interaction.reply('There was a problem getting a random quote. Please try again later');
        }
    },
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
