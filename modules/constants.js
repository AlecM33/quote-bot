module.exports = {
    MAX_QUOTE_LENGTH: 1500,
    MAX_SEARCH_RESULTS: 100,
    WORDCLOUD_SIZE_MAP: {
        1: 'SIZE_SMALL',
        2: 'SIZE_MEDIUM',
        3: 'SIZE_LARGE'
    },
    WORDCLOUD_NUMBER_OF_WORDS_MAP: {
        1: 25,
        2: 50,
        3: 100
    },
    MAX_WORDCLOUD_WORDS: 300,
    MAX_DISCORD_MESSAGE_LENGTH: 2000,
    MAX_AUTHOR_LENGTH: 120,
    MENTION_REGEX: /<@[&!0-9]+>|<#[0-9]+>/g,
    AUTHOR_SEPARATOR: ' • '
};
