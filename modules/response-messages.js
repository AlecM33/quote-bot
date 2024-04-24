module.exports = {
    INVALID_FORMATTING: 'Your command had invalid formatting! use **!quotes help** to see correct usage.',
    AUTHOR_ARG_REQUIRED: 'You must specify an author to list quotes from. Use **!quotes help** to see correct usage.',
    ADD_SUCCESS: 'Your quote was saved successfully.',
    DELETE_SUCCESS: 'The quote was successfully removed.',
    NOTHING_DELETED: 'There is no quote with that identifier, so nothing was deleted.',
    DUPLICATE_QUOTE: 'An identical quote by this person has already been saved!',
    GENERIC_RETRIEVAL_ERROR: 'There was a problem retrieving the specified quotes. Please contact the developer.',
    INCORRECT_AUTHOR_SYNTAX: "Invalid command. The author's name can only contain letters and spaces.",
    QUOTE_COUNT_0: 'There are no quotes saved!',
    GENERIC_ERROR_COUNT_COMMAND: 'There was a problem getting the number of quotes. Please try again later.',
    NO_QUOTES_BY_AUTHOR: 'I couldn\'t find any quotes to choose from!',
    RANDOM_QUOTE_GENERIC_ERROR: 'There was a problem getting a random quote. Please try again later',
    EMPTY_QUERY: 'There were no quotes found matching your search.',
    QUERY_TOO_GENERAL: 'Your search returned more than ' + require('./constants.js').MAX_SEARCH_RESULTS + ' results. Try narrowing your search.',
    SEARCH_RESULT_TOO_LONG: 'Your search returned results, but returning them all would exceed Discord\'s 2000 character limit for messages.' +
    ' You can either narrow your search, or you can always download saved quotes using the `/download` command.',
    GENERIC_INTERACTION_ERROR: 'There was an error while executing this command! Feel free to contact the developer using' +
        ' info found with the `/help` commmand.',
    HELP_MESSAGE: 'To get the latest info on ' +
        'changes to the bot, use the `/updates` command. To add the bot to another server, use [this link](https://discord.com/oauth2/authorize?client_id=777314683333771285&permissions=277025392640&scope=bot).\n\n' +
        '`/add` - Add a quote. The author can be a mention of a user in the server (e.g. @Bob) or simply a name (Bob). You ' +
        'do not need to wrap the quote in quotation marks. If the quote was said before today, you can optionally provide a "date" parameter (MM/DD/YYYY or MM-DD-YYYY).\n' +
        '`/search` - Find quotes that match a word or phrase.\n' +
        '`/random` - Pull a random quote, optionally by a specific author.\n' +
        '`/download` - Receive all the quotes you have saved as a text file.\n' +
        '`/authors` - Receive a list of all unique authors of saved quotes.\n' +
        '`/count` - See how many quotes have been saved.\n' +
        '`/delete` - Remove a quote by providing its numerical identifier. The identifier can be obtained by using the "/search" command with the `include_identifier` ' +
        'option as `true`.\n' +
        '`/wordcloud` - Generate a wordcloud visualization of quotes said in your server. This includes ' +
        'options to use a specific author\'s quotes and to use your choice of font. By default, the font will be one of ' +
        'Georgia, Rockwell, Century Gothic, or Trebuchet MS. Additional fonts include Arial, Verdana, Tahoma, ' +
        'Impact, Times New Roman, Baskerville, Courier, Comic Sans, Calibri, Consolas, and Segoe UI.\n\n' +
        '**Privacy Policy:**\n\n' +
        'Quotes added in a particular server can only be retrieved by users in that server. ' +
        'The bot stores quotes in a secure database to which only the bot and its creator have access. For safety, the bot will not accept quotes that produce hyperlinks, Other than that, ' +
        'quote content moderation is only about as good as your server\'s moderation.\n\n' +
        '**Support:**\n\nFor questions or concerns, you can e-mail the creator at quote.bot.contact@gmail.com. Thanks so much for using my bot! :)\n\n' +
        'This bot is open source! Find it at: <https://github.com/AlecM33/quote-bot>',
    UPDATES_MESSAGE: '**Latest Updates**\n\n**v1.1.0 - Changes to /wordcloud** (23 March 2024)\n- the wordcloud command now supports a "font" option with several choices. Reference those using the ' +
        '/help command. To improve consistency in the visual output, the "size" option has been removed in favor of a single standard size. \n\n**v1.0.2** (11 March 2024)\n- Fixed a bug that prevented the `/authors` command ' +
        'from working if the bot\'s reply would exceed Discord\'s maximum message length. Now, if this would be the case, it will attach ' +
        'the authors as a file instead. \n\n**1000 quotes!** (28 December 2023)\n- This bot is now storing over 1000 ' +
        'quotes from several dozen servers. Cheers to the new year and happy quoting!\n\n**v1.0.1** (7 November 2023)\n-' +
        ' There is now an optional "date" parameter for the `/add` command. If a quote was said a while ago, and you want' +
        ' to capture that when saving it with this bot, provide a date. The bot will say it was added on that day. Otherwise,' +
        ' it will use today\'s date.'
};
