module.exports = {
    INVALID_FORMATTING: 'Your command had invalid formatting! use **!quotes help** to see correct usage.',
    AUTHOR_ARG_REQUIRED: 'You must specify an author to list quotes from. Use **!quotes help** to see correct usage.',
    ADD_SUCCESS: 'Your quote was saved successfully.',
    DELETE_SUCCESS: 'The quote was successfully removed.',
    NOTHING_DELETED: 'There is no quote with that identifier, so nothing was deleted.',
    DUPLICATE_QUOTE: 'An identical quote by this person has already been saved!',
    GENERIC_ERROR: 'There was a problem saving your quote. Please try again later',
    GENERIC_RETRIEVAL_ERROR: 'There was a problem retrieving the specified quotes. Please contact the developer.',
    INCORRECT_AUTHOR_SYNTAX: "Invalid command. The author's name can only contain letters and spaces.",
    QUOTE_COUNT_0: 'There are no quotes!',
    GENERIC_ERROR_COUNT_COMMAND: 'There was a problem getting the number of quotes. Please try again later.',
    NO_QUOTES_BY_AUTHOR: 'There are no quotes stored by that author!',
    RANDOM_QUOTE_GENERIC_ERROR: 'There was a problem getting a random quote. Please try again later',
    EMPTY_QUERY: 'There were no quotes found matching your search.',
    QUERY_TOO_GENERAL: 'Your search returned too many results! Use a narrower search.',
    HELP_MESSAGE: '**About:**\n\nThis is a bot for adding quotes and revisiting them later. Add a quote with `/add`. Find quotes with `/search`.' +
        ' Pull random quotes with `/random`. To delete a quote, you must first search for it with the `include_identifier` ' +
        'option as `true`. This will return an integer ID for the quote. Then, provide that ID to the `/delete` command.' +
        ' You can also generate a "wordcloud" visualization of quotes said in your server using `/wordcloud`.\n\n' +
        '**Privacy Policy:**\n\n' +
        'Quotes added in a particular server can only be retrieved by users in that server. ' +
        'The bot uses an SSL connection to store your quotes in a password-protected database. Only the bot and its ' +
        'creator have access. Quotes (but not the names of their authors) are stored with encryption. The data is only' +
        ' used for this bot and its associated commands.\n\n' +
        '**Support:**\n\nFor questions or concerns, you can e-mail the creator at leohfx@gmail.com\n\n' +
        'This bot is open source! Find it at: https://github.com/AlecM33/quote-bot'
};
