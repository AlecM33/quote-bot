const pool = require('./db');

module.exports = {

    fetchAllQuotes: () => {
        return query({
            text: 'SELECT * FROM quotes;'
        });
    },

    addQuote: (quote, author) => {
        const now = new Date(Date.now());

        return query({
            text: 'INSERT INTO quotes VALUES ($1, $2, $3);',
            values: [quote, author.toLowerCase(), (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear()]
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
