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

        if (toFile && /^<@[&!0-9]+>|<#[0-9]+>$/.test(quote.author)) { // Discord @s are represented as <@UserID>
            quoteMessage = quoteMessage + ' - ' + await attemptToResolveMentionToName(guildManager, interaction, quote.author);
        } else {
            quoteMessage = quoteMessage + ' - ' + quote.author;
        }

        if (includeDate) {
            quoteMessage += ' (added ' + d.toLocaleString('default', {
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

    validateAddCommand: async (quote, author, interaction) => {
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
async function attemptToResolveMentionToName (guildManager, interaction, author) {
    try {
        const guild = await guildManager.fetch(interaction.guildId);
        if (guild) {
            const entity = await getEntity(guild, author);
            if (entity) {
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
        }
        return 'User not found';
    } catch (e) {
        console.error(e);
        return 'User not found';
    }
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
