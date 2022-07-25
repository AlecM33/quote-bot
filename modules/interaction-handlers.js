const responseMessages = require('../response-messages.js');
const queries = require('../database/queries.js');

module.exports = {

    addHandler: async (interaction) => {
        const author = interaction.options.getString('author').trim().toLowerCase();
        const quote = interaction.options.getString('quote').trim().toLowerCase();
        await queries.addQuote(quote, author, interaction.guildId).catch(async (e) => {
            if (e.includes('duplicate key')) {
                await interaction.reply(responseMessages.DUPLICATE_QUOTE);
            } else {
                await interaction.reply(responseMessages.GENERIC_ERROR);
            }
        });

        if (!interaction.replied) {
            await interaction.reply(responseMessages.SUCCESS);
        }
    },

    countHandler: async (interaction) => {
        const author = interaction.options.getString('author')?.trim().toLowerCase();
        try {
            const queryResult = author ? await queries.fetchQuoteCountByAuthor(author) : await queries.fetchQuoteCount();
            if (queryResult.length > 0) {
                if (author) {
                    const capitalizedAuthor = author.charAt(0).toUpperCase() + author.slice(1);
                    await interaction.reply('**' + capitalizedAuthor + '** has said **' + queryResult[0].count + '** quotes.');
                } else {
                    await interaction.reply('There are **' + queryResult[0].count + '** quotes.');
                }
            } else {
                await interaction.reply(responseMessages.QUOTE_COUNT_0);
            }
        } catch (e) {
            await interaction.reply(responseMessages.GENERIC_ERROR_COUNT_COMMAND);
        }
    },

    randomHandler: async (interaction) => {
        const author = interaction.options.getString('author')?.trim().toLowerCase();
        try {
            const queryResult = author ? await queries.getQuotesFromAuthor(author) : await queries.fetchAllQuotes();
            if (queryResult.length > 0) {
                const randomQuote = queryResult[Math.floor(Math.random() * (queryResult.length - 0))];
                await interaction.reply(formatQuote(randomQuote));
            } else {
                await interaction.reply(responseMessages.NO_QUOTES_BY_AUTHOR);
            }
        } catch (e) {
            await interaction.reply(responseMessages.RANDOM_QUOTE_GENERIC_ERROR);
        }
    },

    searchHandler: async (interaction) => {
        const searchString = interaction.options.getString('search_string')?.trim().toLowerCase();
        const searchResults = await queries.fetchQuotesBySearchString(searchString).catch(async (e) => {
            await interaction.reply(responseMessages.GENERIC_ERROR);
        });

        let reply = '';
        if (searchResults.length === 0) {
            reply += responseMessages.EMPTY_QUERY;
        } else if (searchResults.length > 10) {
            reply += responseMessages.QUERY_TOO_GENERAL;
        } else {
            reply += 'Your search for "' + searchString + '" returned **' + searchResults.length + '** quotes: \n\n';
            for (const result of searchResults) {
                const quote = formatQuote(result);
                reply += quote + '\n';
            }
        }

        if (!interaction.replied) {
            await interaction.reply(reply);
        }
    }
};

function formatQuote (quote) {
    const capitalizedAuthor = quote.author.charAt(0).toUpperCase() + quote.author.slice(1);
    const d = new Date(quote.said_at);
    const year = d.getFullYear().toString().slice(2);
    return '_"' + quote.quotation + '"_ - ' + capitalizedAuthor + ' (' + (d.getMonth() + 1) + '/' + (d.getDate() + 1) + '/' + year + ')';
}
