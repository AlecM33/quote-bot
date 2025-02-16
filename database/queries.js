const pool = require('./db');

module.exports = {

    fetchAllQuotes: (guildId) => {
        return query({
            text: `SELECT
                     id,
                     quotation,
                     author,
                     said_at
                   FROM quotes WHERE guild_id = $1;`,
            values: [guildId]
        });
    },

    addQuote: (
        quote,
        author,
        guildId,
        saidAt = (() => {
            const now = new Date(Date.now());
            return (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
        })()
    ) => {
        return query({
            text: `INSERT INTO quotes VALUES (
                DEFAULT,
                $1,
                $2,
                $3,
                $4,
                digest($5, 'sha256')
            ) RETURNING
                id,
                quotation,
                author,
                said_at;`,
            values: [
                quote,
                author,
                saidAt,
                guildId,
                guildId.toLowerCase() + quote.toLowerCase() + author.toLowerCase()
            ]
        });
    },

    fetchUniqueAuthors: (guildId) => {
        return query({
            text: `SELECT DISTINCT author FROM quotes WHERE guild_id = $1 ORDER BY author;`,
            values: [
                guildId
            ]
        });
    },

    getQuotesFromAuthor: (author, guildId) => {
        return query({
            text: `SELECT
                     id,
                     quotation,
                     author,
                     said_at
                   FROM quotes WHERE author = $1 AND guild_id = $2;`,
            values: [
                author,
                guildId
            ]
        });
    },

    fetchQuoteCount: (guildId) => {
        return query({
            text: 'SELECT COUNT(*) FROM quotes WHERE guild_id = $1;',
            values: [guildId]
        });
    },

    fetchQuoteCountByAuthor: (author, guildId) => {
        return query({
            text: 'SELECT COUNT(*) FROM quotes WHERE author = $1 AND guild_id = $2;',
            values: [author, guildId]
        });
    },

    fetchQuotesBySearchStringAndAuthor: (searchString, guildId, author) => {
        return query({
            text: `SELECT
                      id,
                      quotation,
                      author,
                      said_at FROM quotes
                   WHERE author = $1 AND LOWER(quotation) LIKE LOWER($2) AND guild_id = $3;`,
            values: [
                author,
                '%' + searchString + '%',
                guildId
            ]
        });
    },

    fetchQuotesBySearchString: (searchString, guildId) => {
        return query({
            text: `SELECT
                      id,
                      quotation,
                      author,
                      said_at FROM quotes
                   WHERE LOWER(quotation) LIKE LOWER($1) AND guild_id = $2;`,
            values: [
                '%' + searchString + '%',
                guildId
            ]
        });
    },

    deleteQuoteById: (id, guildId) => {
        return query({
            text: `DELETE FROM quotes WHERE id = $1 AND guild_id = $2 RETURNING
                     id,
                     quotation,
                     author,
                     said_at;`,
            values: [id, guildId]
        });
    }

};

function query (queryParams) {
    return new Promise((resolve, reject) => {
        console.time("query");
        pool.connect().then((client) => client.query(queryParams, (err, res) => {
            if (err) {
                client.release();
                console.error(err);
                console.timeEnd("query");
                reject(err);
            } else {
                client.release();
                console.timeEnd("query");
                resolve(res.rows);
            }
        })).catch((e) => {
            console.error(e);
            console.timeEnd("query");
            reject(new Error('The bot could not complete your request due to connection issues.'));
        });
    });
}
