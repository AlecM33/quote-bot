const pool = require('./db');
const encryptionKey = process.env.ENCRYPTION_KEY?.trim();

module.exports = {

    fetchAllQuotes: (guildId) => {
        return query({
            text: `SELECT
                     id,
                     PGP_SYM_DECRYPT(quotation::bytea, $1) as quotation,
                     PGP_SYM_DECRYPT(author::bytea, $2) as author,
                     said_at
                   FROM quotes WHERE PGP_SYM_DECRYPT(guild_id::bytea, $3) = $4;`,
            values: [encryptionKey, encryptionKey, encryptionKey, guildId]
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
                PGP_SYM_ENCRYPT($1, $2)::text,
                PGP_SYM_ENCRYPT($3, $4)::text,
                $5,
                PGP_SYM_ENCRYPT($6, $7)::text,
                digest($8, 'sha256')
            ) RETURNING
                id,
                PGP_SYM_DECRYPT(quotation::bytea, $9) as quotation,
                PGP_SYM_DECRYPT(author::bytea, $10) as author,
                said_at;`,
            values: [
                quote,
                encryptionKey,
                author,
                encryptionKey,
                saidAt,
                guildId,
                encryptionKey,
                guildId + quote + author,
                encryptionKey,
                encryptionKey
            ]
        });
    },

    getQuotesFromAuthor: (author, guildId) => {
        return query({
            text: `SELECT
                     id,
                     PGP_SYM_DECRYPT(quotation::bytea, $1) as quotation,
                     PGP_SYM_DECRYPT(author::bytea, $2) as author,
                     said_at
                   FROM quotes WHERE PGP_SYM_DECRYPT(author::bytea, $3) = $4 AND PGP_SYM_DECRYPT(guild_id::bytea, $5) = $6;`,
            values: [
                encryptionKey,
                encryptionKey,
                encryptionKey,
                author,
                encryptionKey,
                guildId
            ]
        });
    },

    fetchQuoteCount: (guildId) => {
        return query({
            text: 'SELECT COUNT(*) FROM quotes WHERE PGP_SYM_DECRYPT(guild_id::bytea, $1) = $2;',
            values: [encryptionKey, guildId]
        });
    },

    fetchQuoteCountByAuthor: (author, guildId) => {
        return query({
            text: 'SELECT COUNT(*) FROM quotes WHERE PGP_SYM_DECRYPT(author::bytea, $1) = $2 AND PGP_SYM_DECRYPT(guild_id::bytea, $3) = $4;',
            values: [encryptionKey, author, encryptionKey, guildId]
        });
    },

    fetchQuotesBySearchString: (searchString, guildId) => {
        return query({
            text: `SELECT
                      id,
                      PGP_SYM_DECRYPT(quotation::bytea, $1) as quotation,
                      PGP_SYM_DECRYPT(author::bytea, $2) as author,
                      said_at FROM quotes
                   WHERE PGP_SYM_DECRYPT(quotation::bytea, $3) LIKE $4 AND PGP_SYM_DECRYPT(guild_id::bytea, $5) = $6;`,
            values: [
                encryptionKey,
                encryptionKey,
                encryptionKey,
                '%' + searchString + '%',
                encryptionKey,
                guildId
            ]
        });
    },

    deleteQuoteById: (id, guildId) => {
        return query({
            text: `DELETE FROM quotes WHERE id = $1 AND PGP_SYM_DECRYPT(guild_id::bytea, $2) = $3 RETURNING
                     id,
                     PGP_SYM_DECRYPT(quotation::bytea, $4) as quotation,
                     PGP_SYM_DECRYPT(author::bytea, $5) as author,
                     said_at;`,
            values: [id, encryptionKey, guildId, encryptionKey, encryptionKey]
        });
    }

};

function query (queryParams) {
    return new Promise((resolve, reject) => {
        pool.connect().then((client) => client.query(queryParams, (err, res) => {
            if (err) {
                client.release();
                reject(err);
            } else {
                client.release();
                resolve(res.rows);
            }
        })).catch((e) => {
            console.error(e);
            reject(new Error('The bot could not complete your request due to connection issues.'));
        });
    });
}
