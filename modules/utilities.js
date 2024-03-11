const STOP_WORDS = require('../modules/stop-words.js');
const constants = require('./constants.js');

module.exports = {
    formatQuote: async (
        quote,
        includeDate = true,
        includeIdentifier = false,
        includeMarkdown = true,
        toFile = false,
        guildManager = null,
        interaction = null
    ) => {
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

        if (toFile && quote.author.match(constants.MENTION_REGEX)) { // Discord @s are represented as <@UserID>
            quoteMessage = quoteMessage + ' - ' + await attemptToResolveMentionsToName(guildManager, interaction, quote.author);
        } else {
            quoteMessage = quoteMessage + ' - ' + quote.author;
        }

        if (includeDate) {
            quoteMessage += ' (' + d.toLocaleString('default', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) + ')';
        }

        if (includeIdentifier) {
            quoteMessage += ' (**identifier**: ' + quote.id + ')';
        }

        return quoteMessage;
    },

    formatAuthor: async (guildManager, interaction, author) => {
        return await attemptToResolveMentionsToName(guildManager, interaction, author);
    },

    validateAddCommand: async (quote, author, date, interaction) => {
        let reply = 'Your quote has the following problems:\n\n';
        let hasProblem = false;
        if (quote.length > constants.MAX_QUOTE_LENGTH) {
            reply += '- Your quote of length ' + quote.length + ' characters exceeds the maximum allowed length of ' +
                constants.MAX_QUOTE_LENGTH + ' characters.\n';
            hasProblem = true;
        }
        if (author.length > constants.MAX_AUTHOR_LENGTH) {
            reply += '- Your author of length ' + author.length + ' characters exceeds the maximum allowed length of ' +
                constants.MAX_AUTHOR_LENGTH + ' characters.\n';
            hasProblem = true;
        }
        if (quote.toLowerCase().includes('http://') || quote.toLowerCase().includes('https://')) {
            reply += '- Quotes with links are disallowed.';
            hasProblem = true;
        }
        if (date && !date.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/)) {
            reply += 'Your provided date has incorrect formatting. Use MM/DD/YYYY or MM-DD-YYYY (e.g. 08/15/2021 or 8-15-21)';
            hasProblem = true;
        }
        if (hasProblem) {
            await interaction.reply({ content: reply, ephemeral: true });
        }
    },

    mapQuotesToFrequencies: (quotesForCloud) => {
        const wordsWithOccurrences = [];
        for (const quote of quotesForCloud) {
            const words = quote.quotation
                .split(' ')
                .map((word) => word.toLowerCase().replace(/[^a-zA-Z0-9-']/g, ''))
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
};

/* When quotes are written to a text file, we want to resolve an ID to a name in the server, if it still exists,
       so that we don't end up writing a representation of the mention (e.g. <@123>) as the author. */
async function attemptToResolveMentionsToName (guildManager, interaction, author) {
    try {
        const guild = await guildManager.fetch(interaction.guildId);
        if (guild) {
            const mentions = author.match(constants.MENTION_REGEX);
            for (const mention of mentions) {
                let entity;
                try {
                    entity = await getEntity(guild, mention);
                } catch (e) {
                    author = author.replaceAll(mention, 'Unknown User');
                    continue;
                }
                if (entity) {
                    const resolved = resolveEntity(entity);
                    author = author.replaceAll(mention, resolved);
                } else {
                    author = author.replaceAll(mention, 'Unknown User');
                }
            }
        }
        return author;
    } catch (e) {
        console.error(e);
        return 'Unknown User(s)';
    }
}

function resolveEntity (entity) {
    return entity.nickname
        ? '@' + entity.nickname
        : (() => {
            if (entity.user) {
                return '@' + entity.user.username;
            } else if (entity.constructor.name === 'Role') {
                return '@' + entity.name;
            } else {
                return '#' + entity.name; // a channel
            }
        })();
}

async function getEntity (guild, author) {
    if (/^<@&[0-9]+>$/.test(author)) {
        return await guild.roles.fetch(author.replace(/[^0-9]/g, ''));
    } else if (/^<#[0-9]+>$/.test(author)) {
        return await guild.channels.fetch(author.replace(/[^0-9]/g, ''));
    } else {
        return await guild.members.fetch(author.replace(/[^0-9]/g, ''));
    }
}
