const responseMessages = require('./response-messages.js');
const queries = require('../database/queries.js');
const { AttachmentBuilder } = require('discord.js');
const wordcloudConstructor = require('../modules/wordcloud-constructor.js');
const { JSDOM } = require('jsdom');
const sharp = require('sharp');
const constants = require('./constants.js');
const utilities = require('./utilities.js');

module.exports = {

    helpHandler: async (interaction) => {
        console.info(`HELP command invoked by guild: ${interaction.guildId}`);
        try {
            await interaction.reply({
                content: responseMessages.HELP_MESSAGE,
                ephemeral: true
            });
        } catch (e) {
            console.error(e);
            await interaction.reply({
                content: responseMessages.GENERIC_INTERACTION_ERROR,
                ephemeral: true
            });
        }
    },

    updatesHandler: async (interaction) => {
        console.info(`UPDATES command invoked by guild: ${interaction.guildId}`);
        try {
            await interaction.reply({
                content: responseMessages.UPDATES_MESSAGE,
                ephemeral: true
            });
        } catch (e) {
            console.error(e);
            await interaction.reply({
                content: responseMessages.GENERIC_INTERACTION_ERROR,
                ephemeral: true
            });
        }
    },

    downloadHandler: async (interaction, guildManager) => {
        console.info(`DOWNLOAD command invoked by guild: ${interaction.guildId}`);
        await interaction.deferReply({ ephemeral: true });
        let content = '';
        try {
            const allQuotesFromServer = await queries.fetchAllQuotes(interaction.guildId);
            if (allQuotesFromServer.length === 0) {
                await interaction.followUp('There haven\'t been any quotes saved from this server, so I didn\'t attach a file.');
                return;
            }
            for (const quote of allQuotesFromServer) {
                content += await utilities.formatQuote(
                    quote,
                    true,
                    false,
                    true,
                    guildManager,
                    interaction
                ) + '\n';
            }
            const buffer = Buffer.from(content);
            await interaction.followUp({
                files: [new AttachmentBuilder(buffer, { name: 'quotes.txt' })],
                content: 'Here you go: all the quotes saved from this server!',
                ephemeral: true
            });
        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: responseMessages.GENERIC_INTERACTION_ERROR, ephemeral: true });
        }
    },

    addHandler: async (interaction) => {
        console.info(`ADD command invoked by guild: ${interaction.guildId}`);
        const author = interaction.options.getString('author').trim();
        const quote = interaction.options.getString('quote').trim();
        const date = interaction.options.getString('date')?.trim();
        await utilities.validateAddCommand(quote, author, date, interaction);
        console.info(`SAID BY: ${author}`);
        if (!interaction.replied) {
            const result = await queries.addQuote(quote, author, interaction.guildId, date).catch(async (e) => {
                if (e.message.includes('duplicate key')) {
                    await interaction.reply({ content: responseMessages.DUPLICATE_QUOTE, ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Error adding your quote: ' + e.message, ephemeral: true });
                }
            });
            if (!interaction.replied) {
                await interaction.reply('Added the following:\n\n' + await utilities.formatQuote(result[0], date !== undefined, false));
            }
        }
    },

    countHandler: async (interaction) => {
        console.info(`COUNT command invoked by guild: ${interaction.guildId}`);
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
        console.info(`RANDOM command invoked by guild: ${interaction.guildId}`);
        const author = interaction.options.getString('author')?.trim();
        try {
            const queryResult = author && author.length > 0
                ? await queries.getQuotesFromAuthor(author, interaction.guildId)
                : await queries.fetchAllQuotes(interaction.guildId);
            if (queryResult.length > 0) {
                const randomQuote = queryResult[Math.floor(Math.random() * queryResult.length)];
                await interaction.reply(await utilities.formatQuote(randomQuote, true, false));
            } else {
                await interaction.reply(responseMessages.NO_QUOTES_BY_AUTHOR);
            }
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: responseMessages.RANDOM_QUOTE_GENERIC_ERROR, ephemeral: true });
        }
    },

    searchHandler: async (interaction) => {
        console.info(`SEARCH command invoked by guild: ${interaction.guildId}`);
        await interaction.deferReply();
        const searchString = interaction.options.getString('search_string')?.trim();
        const includeIdentifier = interaction.options.getBoolean('include_identifier');
        const searchResults = await queries.fetchQuotesBySearchString(searchString, interaction.guildId).catch(async (e) => {
            console.error(e);
            await interaction.followUp({ content: responseMessages.GENERIC_INTERACTION_ERROR });
        });

        let reply = '';
        if (searchResults.length === 0) {
            reply += responseMessages.EMPTY_QUERY;
        } else if (searchResults.length > constants.MAX_SEARCH_RESULTS) {
            reply += responseMessages.QUERY_TOO_GENERAL;
        } else {
            for (const result of searchResults) {
                const quote = await utilities.formatQuote(result, true, includeIdentifier);
                reply += quote + '\n';
            }
        }

        if (!interaction.replied) {
            if (reply.length > constants.MAX_DISCORD_MESSAGE_LENGTH) {
                await interaction.followUp({ content: responseMessages.SEARCH_RESULT_TOO_LONG });
            } else {
                await interaction.followUp({ content: reply });
            }
        }
    },

    deleteHandler: async (interaction) => {
        console.info(`DELETE command invoked by guild: ${interaction.guildId}`);
        const result = await queries.deleteQuoteById(interaction.options.getInteger('identifier'), interaction.guildId).catch(async (e) => {
            console.error(e);
            await interaction.reply({ content: responseMessages.GENERIC_INTERACTION_ERROR, ephemeral: true });
        });

        if (!interaction.replied) {
            if (result.length === 0) {
                await interaction.reply({ content: responseMessages.NOTHING_DELETED, ephemeral: true });
            } else {
                await interaction.reply('The following quote was deleted: \n\n' + await utilities.formatQuote(result[0], true, false));
            }
        }
    },

    wordcloudHandler: async (interaction) => {
        console.info(`WORDCLOUD command invoked by guild: ${interaction.guildId}`);
        await interaction.deferReply();
        // TODO: d3-cloud requires that document be defined in the global scope. Long-term, this is a problem.
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
        try {
            const wordsWithOccurrences = utilities.mapQuotesToFrequencies(quotesForCloud);
            const constructor = await wordcloudConstructor;
            const initializationResult = constructor.initialize(
                wordsWithOccurrences
                    .sort((a, b) => a.frequency >= b.frequency ? -1 : 1)
                    .slice(0, constants.MAX_WORDCLOUD_WORDS),
                constants.WORDCLOUD_SIZE
            );
            initializationResult.cloud.on('end', () => {
                const d3 = constructor.draw(
                    initializationResult.cloud,
                    initializationResult.words,
                    global.document.body
                );
                const buffer = Buffer.from(d3.select(global.document.body).node().innerHTML.toString());
                sharp(buffer)
                    .resize(constants.WORDCLOUD_SIZE, constants.WORDCLOUD_SIZE)
                    .png()
                    .toBuffer()
                    .then(async (data) => {
                        await interaction.followUp({
                            files: [new AttachmentBuilder(data, { name: 'wordcloud.png' })],
                            content: author && author.length > 0
                                ? 'Here\'s a wordcloud for quotes said by "' + author + '"!'
                                : 'Here\'s a wordcloud I generated from this server\'s quotes!'
                        });
                    })
                    .catch(async err => {
                        console.error(err);
                        await interaction.followUp({
                            content: responseMessages.GENERIC_INTERACTION_ERROR
                        });
                    });
            });
            initializationResult.cloud.start();
        } catch(e) {
            console.error(e);
            await interaction.followUp({
                content: responseMessages.GENERIC_INTERACTION_ERROR
            });
        }
    },

    authorsHandler: async (interaction, guildManager) => {
        console.info(`AUTHORS command invoked by guild: ${interaction.guildId}`);
        await interaction.deferReply();
        try {
            let reply;
            const queryResult = await queries.fetchUniqueAuthors(interaction.guildId);
            if (queryResult.length > 0) {
                let cumulativeAuthorMessageLength = constants.AUTHOR_SEPARATOR.length * queryResult.length;
                const authors = queryResult.map(row => {
                    cumulativeAuthorMessageLength += row.author.length;
                    return row.author;
                });
                // If the message listing the authors would be too long, we will attach them as a file instead.
                if (cumulativeAuthorMessageLength > constants.MAX_DISCORD_MESSAGE_LENGTH) {
                    reply = await authors
                        .reduce(async (accumulator, value, index) => {
                            if (value.match(constants.MENTION_REGEX)) {
                                value = await utilities.formatAuthor(guildManager, interaction, value);
                            }
                            if (index === 0) {
                                return await accumulator + value;
                            } else {
                                return await accumulator + '\n' + value;
                            }
                        }, '');
                    const buffer = Buffer.from(reply);
                    await interaction.followUp({
                        files: [new AttachmentBuilder(buffer, { name: 'authors.txt' })],
                        content: 'Here are all the different authors. There are a lot of them, so I put them in the attached text file.'
                    });
                } else {
                    reply = await authors
                        .reduce(async (accumulator, value, index) => {
                            if (index === 0) {
                                return await accumulator + value;
                            } else {
                                return await accumulator + constants.AUTHOR_SEPARATOR + value;
                            }
                        }, '');
                    await interaction.followUp('Here are all the different authors, separated by bullet points: \n\n' + reply);
                }
            } else {
                await interaction.followUp(responseMessages.QUOTE_COUNT_0);
            }
        } catch (e) {
            console.error(e);
            await interaction.followUp({ content: responseMessages.GENERIC_INTERACTION_ERROR, ephemeral: true });
        }
    }
};
