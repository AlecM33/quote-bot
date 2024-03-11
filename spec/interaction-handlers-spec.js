const interactionHandlers = require('../modules/interaction-handlers.js');
const queries = require('../database/queries.js');
const responseMessages = require('../modules/response-messages.js');
const utilities = require('../modules/utilities.js');
const constants = require('../modules/constants.js');

describe('interaction handlers', () => {
    describe('#addHandler', () => {
        let interaction;

        beforeEach(() => {
            interaction = {
                options: {
                    getString: (string) => {
                        if (string === 'author') {
                            return 'author';
                        } else if (string === 'quote') {
                            return 'quote';
                        }

                        return null;
                    }
                },
                guildId: '123',
                reply: async (message) => { this.replied = true; },
                replied: false
            };

            spyOn(interaction, 'reply');
        });

        it('should echo back a successfully added quote', async () => {
            spyOn(queries, 'addQuote').and.callFake(async (quote, author, guildId) => {
                interaction.replied = false;
                return {
                    0: {
                        quotation: 'test',
                        author: 'jane doe',
                        said_at: '2022-02-02'
                    },
                    catch: (e) => {}
                };
            });

            spyOn(utilities, 'validateAddCommand');

            await interactionHandlers.addHandler(interaction);

            expect(queries.addQuote).toHaveBeenCalledWith('quote', 'author', '123', undefined);
            expect(interaction.reply).toHaveBeenCalledWith('Added the following:\n\n_"test"_ - jane doe');
        });

        it('should throw a duplicate key exception', async () => {
            spyOn(queries, 'addQuote').and.callFake(async (quote, author, guildId) => {
                interaction.replied = true;
                throw new Error('could not connect to database');
            });
            spyOn(utilities, 'validateAddCommand');
            try {
                await interactionHandlers.addHandler(interaction);
            } catch (e) {
                expect(queries.addQuote).toThrow();
                expect(interaction.reply).toHaveBeenCalledWith(responseMessages.DUPLICATE_QUOTE);
            }
        });

        it('should throw a generic exception', async () => {
            spyOn(queries, 'addQuote').and.callFake(async (quote, author, guildId) => {
                interaction.replied = true;
                throw new Error('could not connect to database');
            });
            spyOn(utilities, 'validateAddCommand');
            try {
                await interactionHandlers.addHandler(interaction);
            } catch (e) {
                expect(queries.addQuote).toThrow();
                expect(interaction.reply).toHaveBeenCalledWith(responseMessages.GENERIC_ERROR);
            }
        });
    });

    describe('#randomHandler', () => {
        let interaction;

        beforeAll(() => {
            interaction = {
                options: {
                    getString: (string) => {
                        if (string === 'author') {
                            return null;
                        }
                    }
                },
                reply: async (message) => { this.replied = true; },
                replied: false,
                guildId: '123'
            };

            spyOn(interaction, 'reply');
        });

        it('should get a random quote from any author if the author is not provided', async () => {
            spyOn(queries, 'fetchAllQuotes').and.returnValue([
                {
                    author: 'jane',
                    said_at: '2022-02-02',
                    quotation: 'hi'
                }
            ]);

            await interactionHandlers.randomHandler(interaction);

            expect(queries.fetchAllQuotes).toHaveBeenCalledWith('123');
            expect(interaction.reply).toHaveBeenCalled();
        });

        it('should get a random quote from a specific author if the author is provided', async () => {
            spyOn(interaction.options, 'getString').and.returnValue('jane');

            spyOn(queries, 'getQuotesFromAuthor').and.returnValue([
                {
                    author: 'jane',
                    said_at: '2022-02-02',
                    quotation: 'hi'
                }
            ]);

            await interactionHandlers.randomHandler(interaction);

            expect(queries.getQuotesFromAuthor).toHaveBeenCalledWith('jane', '123');
            expect(interaction.reply).toHaveBeenCalled();
        });
    });

    describe('#authorsHandler', () => {
        let interaction;

        beforeAll(() => {
            interaction = {
                options: {
                    getString: (string) => {
                        if (string === 'author') {
                            return null;
                        }
                    }
                },
                deferReply: async () => { this.deferred = true; },
                guildId: '123',
                followUp: async (arg) => {}
            };

            spyOn(interaction, 'deferReply');
            spyOn(interaction, 'followUp');
        });

        it('should follow up with a list of authors separated by bullets', async () => {
            spyOn(queries, 'fetchUniqueAuthors').and.returnValue([
                {
                    author: 'jack'
                },
                {
                    author: 'jane'
                }
            ]);

            await interactionHandlers.authorsHandler(interaction);

            expect(queries.fetchUniqueAuthors).toHaveBeenCalledWith('123');
            expect(interaction.followUp).toHaveBeenCalledWith('Here are all the different authors, separated by ' +
                'bullet points: \n\n' + 'jack' + constants.AUTHOR_SEPARATOR + 'jane');
        });

        it('should attach a file if the authors message would be too long', async () => {
            spyOn(queries, 'fetchUniqueAuthors').and.returnValue([
                {
                    author: 'a'.repeat(500)
                },
                {
                    author: 'b'.repeat(500)
                },
                {
                    author: 'c'.repeat(500)
                },
                {
                    author: 'd'.repeat(500)
                }
            ]);

            await interactionHandlers.authorsHandler(interaction);

            expect(queries.fetchUniqueAuthors).toHaveBeenCalledWith('123');
            expect(interaction.followUp).toHaveBeenCalledWith(jasmine.objectContaining(
                {
                    content: 'Here are all the different authors. There are a lot of them, so I put them in the attached text file.'
                }
            ));
        });

        it('should attach a file if the authors message would be too long, formatting authors if necessary', async () => {
            spyOn(queries, 'fetchUniqueAuthors').and.returnValue([
                {
                    author: 'a'.repeat(2000)
                },
                {
                    author: '<@121212121212121212>'
                },
                {
                    author: 'myself and <@121212121212121212>'
                },
                {
                    author: '<#121212121212121212> and myself and <@121212121212121212> and <@&121212121212121212>'
                },
                {
                    author: '@myself'
                },
                {
                    author: '<343434343434>'
                }
            ]);
            spyOn(utilities, 'formatAuthor').and.callFake(async (guildManager, interaction, author) => {
                return await author;
            });

            await interactionHandlers.authorsHandler(interaction, { });

            expect(queries.fetchUniqueAuthors).toHaveBeenCalledWith('123');
            expect(utilities.formatAuthor).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), '<@121212121212121212>');
            expect(utilities.formatAuthor).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), 'myself and <@121212121212121212>');
            expect(utilities.formatAuthor).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), '<#121212121212121212> and myself and <@121212121212121212> and <@&121212121212121212>');
            expect(utilities.formatAuthor).not.toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), '@myself');
            expect(utilities.formatAuthor).not.toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), '<343434343434>');
            expect(interaction.followUp).toHaveBeenCalledWith(jasmine.objectContaining(
                {
                    content: 'Here are all the different authors. There are a lot of them, so I put them in the attached text file.'
                }
            ));
        });
    });
});
