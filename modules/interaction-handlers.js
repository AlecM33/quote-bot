const responseMessages = require('./response-messages.js');
const queries = require('../database/queries.js');
const { MessageAttachment } = require('discord.js');
const STOP_WORDS = require('../modules/stop-words.js');
const wordcloudConstructor = require('../modules/wordcloud-constructor.js');
const { JSDOM } = require('jsdom');
const canvas = require('canvas');
const constants = require('./constants.js');

module.exports = {

    helpHandler: async (interaction) => {
        try {
            await interaction.reply({
                content: responseMessages.HELP_MESSAGE,
                ephemeral: true
            });
        } catch (e) {
            console.error(e);
            await interaction.reply({
                content: responseMessages.GENERIC_ERROR,
                ephemeral: true
            });
        }
    },

    downloadHandler: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        let content = '';
        try {
            const allQuotesFromServer = await queries.fetchAllQuotes(interaction.guildId);
            if (allQuotesFromServer.length === 0) {
                await interaction.reply('There haven\'t been any quotes saved from this server, so I didn\'t attach a file.');
                return;
            }
            for (const quote of allQuotesFromServer) {
                content += formatQuote(quote, true, false, false) + '\n';
            }
            const buffer = Buffer.from(content);
            await interaction.followUp({
                files: [new MessageAttachment(buffer, 'quotes.txt')],
                content: 'Here you go: all the quotes saved from this server!',
                ephemeral: true
            });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: responseMessages.GENERIC_ERROR, ephemeral: true });
        }
    },

    addHandler: async (interaction) => {
        const author = interaction.options.getString('author').trim();
        const quote = interaction.options.getString('quote').trim();
        if (quote.length > constants.MAX_QUOTE_LENGTH) {
            await interaction.reply({
                content: 'Your quote of length ' + quote.length + ' characters exceeds the maximum allowed length of ' +
                    constants.MAX_QUOTE_LENGTH + ' characters.',
                ephemeral: true
            });
            return;
        }
        if (quote.toLowerCase().includes('http://') || quote.toLowerCase().includes('https://')) {
            await interaction.reply({ content: 'Quotes with links are disallowed.', ephemeral: true });
            return;
        }
        const result = await queries.addQuote(quote, author, interaction.guildId).catch(async (e) => {
            if (e.message.includes('duplicate key')) {
                await interaction.reply({ content: responseMessages.DUPLICATE_QUOTE, ephemeral: true });
            } else {
                await interaction.reply({ content: e.message, ephemeral: true });
            }
        });

        if (!interaction.replied) {
            await interaction.reply('Added the following:\n\n' + formatQuote(result[0], false, false));
        }
    },

    countHandler: async (interaction) => {
        const author = interaction.options.getString('author')?.trim();
        try {
            const queryResult = author && author.length > 0
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
            console.error(e);
            await interaction.reply({ content: responseMessages.GENERIC_ERROR_COUNT_COMMAND, ephemeral: true });
        }
    },

    randomHandler: async (interaction) => {
        const author = interaction.options.getString('author')?.trim();
        try {
            const queryResult = author && author.length > 0
                ? await queries.getQuotesFromAuthor(author, interaction.guildId)
                : await queries.fetchAllQuotes(interaction.guildId);
            if (queryResult.length > 0) {
                const randomQuote = queryResult[Math.floor(Math.random() * queryResult.length)];
                await interaction.reply(formatQuote(randomQuote, true, false));
            } else {
                await interaction.reply(responseMessages.NO_QUOTES_BY_AUTHOR);
            }
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: responseMessages.RANDOM_QUOTE_GENERIC_ERROR, ephemeral: true });
        }
    },

    searchHandler: async (interaction) => {
        await interaction.deferReply();
        const searchString = interaction.options.getString('search_string')?.trim();
        const includeIdentifier = interaction.options.getBoolean('include_identifier');
        const searchResults = await queries.fetchQuotesBySearchString(searchString, interaction.guildId).catch(async (e) => {
            console.error(e);
            await interaction.followUp({ content: responseMessages.GENERIC_ERROR, ephemeral: true });
        });

        let reply = '';
        if (searchResults.length === 0) {
            reply += responseMessages.EMPTY_QUERY;
        } else if (searchResults.length > constants.MAX_SEARCH_RESULTS) {
            reply += responseMessages.QUERY_TOO_GENERAL;
        } else {
            reply += 'Your search for "' + searchString + '" returned **' + searchResults.length + '** quotes: \n\n';
            for (const result of searchResults) {
                const quote = formatQuote(result, true, includeIdentifier);
                reply += quote + '\n';
            }
        }

        if (!interaction.replied) {
            if (reply.length > constants.MAX_DISCORD_MESSAGE_LENGTH) {
                await interaction.followUp({ content: responseMessages.SEARCH_RESULT_TOO_LONG, ephemeral: true });
            } else {
                await interaction.followUp(reply);
            }
        }
    },

    deleteHandler: async (interaction) => {
        const result = await queries.deleteQuoteById(interaction.options.getInteger('identifier'), interaction.guildId).catch(async (e) => {
            console.error(e);
            await interaction.reply({ content: responseMessages.GENERIC_ERROR, ephemeral: true });
        });

        if (!interaction.replied) {
            if (result.length === 0) {
                await interaction.reply({ content: responseMessages.NOTHING_DELETED, ephemeral: true });
            } else {
                await interaction.reply('The following quote was deleted: \n\n' + formatQuote(result[0], true, false));
            }
        }
    },

    wordcloudHandler: async (interaction) => {
        await interaction.deferReply();
        global.document = new JSDOM().window.document;
        const author = interaction.options.getString('author')?.trim();
        const quotesForCloud = author && author.length > 0
            ? await queries.getQuotesFromAuthor(author, interaction.guildId)
            : await queries.fetchAllQuotes(interaction.guildId);
        if (quotesForCloud.length === 0) {
            await interaction.followUp({
                content: 'I didn\'t find any quotes to generate a wordcloud from!',
                ephemeral: true
            });
            return;
        }
        const wordsWithOccurrences = mapQuotesToFrequencies(quotesForCloud);
        const constructor = await wordcloudConstructor;
        const initializationResult = constructor.initialize(
            wordsWithOccurrences
                .sort((a, b) => a.frequency >= b.frequency ? -1 : 1)
                .slice(0, constants.MAX_WORDCLOUD_WORDS),
            constants.WORDCLOUD_SIZE_MAP[interaction.options.getInteger('size')] || 'SIZE_MEDIUM'
        );
        initializationResult.cloud.on('end', () => {
            const d3 = constructor.draw(
                initializationResult.cloud,
                initializationResult.words,
                document.body
            );
            const img = new canvas.Image();
            img.onload = async () => {
                const myCanvas = canvas.createCanvas(
                    initializationResult.config[
                        constants.WORDCLOUD_SIZE_MAP[interaction.options.getInteger('size')] || 'SIZE_MEDIUM'
                    ],
                    initializationResult.config[
                        constants.WORDCLOUD_SIZE_MAP[interaction.options.getInteger('size')] || 'SIZE_MEDIUM'
                    ]
                );
                const myContext = myCanvas.getContext('2d');
                myContext.drawImage(img, 0, 0);
                await interaction.followUp({
                    files: [new MessageAttachment(myCanvas.toBuffer('image/png'), 'wordcloud.png')],
                    content: author && author.length > 0
                        ? 'Here\'s a wordcloud for quotes said by "' + author + '"!'
                        : 'Here\'s a wordcloud I generated from this server\'s quotes!'
                });
            };
            img.onerror = err => { throw err; };
            img.src = 'data:image/svg+xml;base64,' + btoa(
                decodeURIComponent(encodeURIComponent(d3.select(global.document.body).node().innerHTML)));
        });
        initializationResult.cloud.start();
    }
};

function formatQuote (quote, includeDate = true, includeIdentifier = false, includeMarkdown = true) {
    const quoteCharacters = ['"', '“', '”'];
    let quoteMessage = quote.quotation;
    const d = new Date(quote.said_at);

    if (!quoteCharacters.includes(quoteMessage.charAt(0))) {
        quoteMessage = '"' + quoteMessage;
    }

    if (!quoteCharacters.includes(quoteMessage.charAt(quoteMessage.length - 1))) {
        quoteMessage = quoteMessage + '"';
    }

    if (includeMarkdown) {
        quoteMessage = '_' + quoteMessage + '_';
    }

    quoteMessage = quoteMessage + ' - ' + quote.author;

    if (includeDate) {
        quoteMessage += ' (added ' + d.toLocaleString('default', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) + ')';
    }

    if (includeIdentifier) {
        quoteMessage += ' (**identifier**: _' + quote.id + '_)';
    }

    return quoteMessage;
}

function mapQuotesToFrequencies (quotesForCloud) {
    const wordsWithOccurrences = [];
    for (const quote of quotesForCloud) {
        const words = quote.quotation
            .split(' ')
            .map((word) => word.toLowerCase().replace(/[^a-zA-Z0-9']/g, ''))
            .filter((word) => word.length > 0 && !STOP_WORDS.includes(word));
        for (const word of words) {
            const existingWord = wordsWithOccurrences.find((element) => element.word === word);
            if (existingWord) {
                existingWord.frequency ++;
            } else {
                wordsWithOccurrences.push({
                    word,
                    frequency: 1
                });
            }
        }
    }
    return wordsWithOccurrences;
}
