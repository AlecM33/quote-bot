const pool = require('./db');

module.exports = {

    fetchAllQuotes: () => {
        return query({
            text: 'SELECT * FROM quotes;'
        });
    },

    addQuote: (quote, author, guildId) => {
        if (typeof guildId !== 'string') {
            guildId = guildId.toString()
        }
        const now = new Date(Date.now());

        return query({
            text: 'INSERT INTO quotes VALUES ($1, $2, $3, $4);',
            values: [
                quote,
                author.toLowerCase(),
                (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear(),
                guildId
            ]
        });
    },

    getQuotesFromAuthor: (author) => {
        return query({
            text: 'SELECT * FROM quotes WHERE author = $1;',
            values: [author]
        });
    },

    fetchQuoteCount: () => {
        return query({
            text: 'SELECT COUNT(*) FROM quotes;'
        });
    },

    fetchQuoteCountByAuthor: (author) => {
        return query({
            text: 'SELECT COUNT(*) FROM quotes WHERE author = $1;',
            values: [author]
        });
    },

    fetchQuotesBySearchString: (searchString) => {
        return query({
            text: 'SELECT * FROM quotes WHERE quotation LIKE $1',
            values: ['%' + searchString + '%']
        });
    }

}

function query (queryParams) {
    return new Promise((resolve, reject) => {
        pool.connect().then((client) => client.query(queryParams, (err, res) => {
            if (err) {
                client.release();
                reject(err.message);
            } else {
                client.release();
                resolve(res.rows);
            }
        }));
    });
}
