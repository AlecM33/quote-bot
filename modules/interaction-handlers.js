const responseMessages = require('../response-messages.js');
const queries = require('../database/queries.js');

module.exports = {

    addHandler: async (interaction) => {
        const author = interaction.options.getString('author').trim().toLowerCase();
        const quote = interaction.options.getString('quote').trim().toLowerCase();
        await queries.addQuote(quote, author).catch(async (e) => {
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
                await interaction.reply('There are no quotes!');
            }
        } catch (e) {
            await interaction.reply('There was a problem getting a random quote. Please try again later');
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
                await interaction.reply('There are no quotes stored by that author!');
            }
        } catch (e) {
            await interaction.reply('There was a problem getting a random quote. Please try again later');
        }
    },

    searchHandler: async (interaction) => {
        const searchString = interaction.options.getString('search_string')?.trim().toLowerCase();
        const searchResults = await queries.fetchQuotesBySearchString(searchString).catch(async (e) => {
            await interaction.reply(responseMessages.GENERIC_ERROR);
        });

        let reply = '';
        if (searchResults.length === 0) {
            reply += 'There were no quotes found matching your search.';
        } else if (searchResults.length > 10) {
            reply += 'Your search returned too many results! Use a narrower search.';
        } else {
            reply += 'Your search for "' + searchString + '" returned **' + searchResults.length + '** quotes: \n\n';
            for (let result of searchResults) {
                const quote = formatQuote(result);
                reply += quote + '\n';
            }
        }

        if (!interaction.replied) {
            await interaction.reply(reply);
        }
    }
}

function formatQuote(quote) {
    const capitalizedAuthor = quote.author.charAt(0).toUpperCase() + quote.author.slice(1);
    const d = new Date(quote.saidat);
    const year = d.getFullYear().toString().slice(2);
    return '_"' + quote.quotation + '"_ - ' + capitalizedAuthor + ' (' + (d.getMonth() + 1) + '/' + (d.getDate() + 1) + '/' + year + ')';

}
