const responseMessages = require('../response-messages.js');
const queries = require('../database/queries.js');

module.exports = {

    addHandler: async (interaction) => {
        const author = interaction.options.getString('author').trim();
        const quote = interaction.options.getString('quote').trim();
        const result = await queries.addQuote(quote, author, interaction.guildId).catch(async (e) => {
            if (e.includes('duplicate key')) {
                await interaction.reply(responseMessages.DUPLICATE_QUOTE);
            } else {
                await interaction.reply(responseMessages.GENERIC_ERROR);
            }
        });

        if (!interaction.replied) {
            await interaction.reply('Added the following:\n\n' + formatQuote(result[0], false, false));
        }
    },

    countHandler: async (interaction) => {
        const author = interaction.options.getString('author')?.trim();
        try {
            const queryResult = author
                ? await queries.fetchQuoteCountByAuthor(author, interaction.guildId)
                : await queries.fetchQuoteCount(interaction.guildId);
            if (queryResult.length > 0) {
                if (author) {
                    await interaction.reply('**' + author + '** has said **' + queryResult[0].count + '** quotes.');
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
        const author = interaction.options.getString('author')?.trim();
        try {
            const queryResult = author
                ? await queries.getQuotesFromAuthor(author, interaction.guildId)
                : await queries.fetchAllQuotes(interaction.guildId);
            if (queryResult.length > 0) {
                const randomQuote = queryResult[Math.floor(Math.random() * queryResult.length)];
                await interaction.reply(formatQuote(randomQuote, true, false));
            } else {
                await interaction.reply(responseMessages.NO_QUOTES_BY_AUTHOR);
            }
        } catch (e) {
            await interaction.reply(responseMessages.RANDOM_QUOTE_GENERIC_ERROR);
        }
    },

    searchHandler: async (interaction) => {
        const searchString = interaction.options.getString('search_string')?.trim();
        const includeIdentifier = interaction.options.getBoolean('include_identifier');
        const searchResults = await queries.fetchQuotesBySearchString(searchString, interaction.guildId).catch(async (e) => {
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
                const quote = formatQuote(result, true, includeIdentifier);
                reply += quote + '\n';
            }
        }

        if (!interaction.replied) {
            await interaction.reply(reply);
        }
    },

    deleteHandler: async (interaction) => {
        const result = await queries.deleteQuoteById(interaction.options.getInteger('identifier'), interaction.guildId).catch(async (e) => {
            await interaction.reply(responseMessages.GENERIC_ERROR);
        });

        if (!interaction.replied) {
            if (result.length === 0) {
                await interaction.reply(responseMessages.NOTHING_DELETED);
            } else {
                await interaction.reply('The following quote was deleted: \n\n' + formatQuote(result[0], true, false));
            }
        }
    }
};

function formatQuote (quote, includeDate = true, includeIdentifier = false) {
    let quoteMessage = '';
    const d = new Date(quote.said_at);
    const year = d.getFullYear().toString().slice(2);

    quoteMessage += '_"' + quote.quotation + '"_ - ' + quote.author

    if (includeDate) {
        quoteMessage += ' (' + (d.getMonth() + 1) + '/' + (d.getDate()) + '/' + year + ')';
    }

    if (includeIdentifier) {
        quoteMessage += ' (**identifier**: _' + quote.id + '_)';
    }

    return quoteMessage;
}
