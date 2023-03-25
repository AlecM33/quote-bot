const queries = require('../database/queries.js');

const verify = (label, booleanExpression) => {
    console.log(label + ': ');
    console.log(
        booleanExpression
            ? '\x1b[32msuccess\x1b[0m'
            : '\x1b[31mfailure\x1b[0m'
    );
};

queries.addQuote('test', 'jane', '1').then((addResult) => {
    console.log(addResult);
    const addedQuoteId = addResult[0].id;
    verify('quote was added to database', addResult.length > 0);
    verify('query returned unencrypted quote', addResult.length > 0 && addResult[0].quotation && addResult[0].quotation === 'test');
    verify('query returned unencrypted author', addResult.length > 0 && addResult[0].author && addResult[0].author === 'jane');
    Promise.all(
        [
            queries.fetchAllQuotes('1'),
            queries.fetchQuotesBySearchString('te', '1'),
            queries.fetchQuoteCount('1'),
            queries.fetchQuoteCountByAuthor('jane', '1')
        ]
    ).then((promiseResults) => {
        for (const result of promiseResults) {
            console.log(result);
            verify('query returned a non-empty result', result.length > 0);
        }
        queries.deleteQuoteById(addedQuoteId, '1').then((deletionResult) => {
            console.log(deletionResult);
            verify('the quote was deleted', deletionResult.length > 0);
            verify(
                'deletion returned unencrypted quote',
                deletionResult.length > 0 && deletionResult[0].quotation && deletionResult[0].quotation === 'test'
            );
            verify(
                'deletion returned unencrypted author',
                deletionResult.length > 0 && deletionResult[0].author && deletionResult[0].author === 'jane'
            );
            console.log('complete.');
            process.exit(0);
        });
    });
});
