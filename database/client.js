const pool = require('./db');

function fetchAllQuotes() {
    return query({
        text: 'SELECT * from quotes;'
    });
}

function addQuote(quote, author) {
    let now = new Date(Date.now());

    return query({
        text: 'INSERT INTO quotes values ($1, $2, $3);',
        values: [quote, author.toLowerCase(), (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear()]
    });
}

function getQuotesFromAuthor(author) {
    return query({
        text: 'SELECT * FROM quotes where author = $1;',
        values: [author]
    });
}

function fetchQuoteCount() {
    return query({
        text: 'SELECT COUNT(*) FROM quotes;'
    })
}

function fetchQuoteCountByAuthor(author) {
    return query({
        text: 'SELECT COUNT(*) FROM quotes WHERE author = $1;',
        values: [author]
    })
}

function query(queryParams) {
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

module.exports = {
    fetchAllQuotes,
    addQuote,
    getQuotesFromAuthor,
    fetchQuoteCountByAuthor,
    fetchQuoteCount
};
