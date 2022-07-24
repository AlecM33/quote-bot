const interactionHandlers = require('../modules/interaction-handlers.js');
const queries = require('../database/queries.js');
const responseMessages = require('../response-messages.js');

describe('interaction handlers', () => {

    describe('#addHandler', () => {

        let interaction;

        beforeAll(() => {
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
                reply: async (message) => { this.replied = true },
                replied: false
            }

            spyOn(interaction, 'reply');
        })

        it('should call the query function for add quote', async () => {
            spyOn(queries, 'addQuote').and.callFake((quote, author) => {
                return {
                    catch: (e) => { }
                }
            });

            await interactionHandlers.addHandler(interaction);

            expect(queries.addQuote).toHaveBeenCalledWith('quote', 'author');
            expect(interaction.reply).toHaveBeenCalledWith(responseMessages.SUCCESS);
        });

        it('should throw a duplicate key exception', async () => {
            spyOn(queries, 'addQuote').and.callFake(async (quote, author) => {
                throw 'duplicate key error';
            });
            try {
                await interactionHandlers.addHandler(interaction);
            } catch(e) {
                expect(queries.addQuote).toThrow();
                expect(interaction.reply).toHaveBeenCalledWith(responseMessages.DUPLICATE_QUOTE);
            }
        });

        it('should throw a generic exception', async () => {
            spyOn(queries, 'addQuote').and.callFake(async (quote, author) => {
                throw 'could not connect to database';
            });
            try {
                await interactionHandlers.addHandler(interaction);
            } catch(e) {
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
                reply: async (message) => { this.replied = true },
                replied: false
            }

            spyOn(interaction, 'reply');
        });

        it('should get a random quote from any author if the author is not provided', async () => {

            spyOn(queries, 'fetchAllQuotes').and.returnValue([
                {
                    author: 'jane',
                    said_at: '2022-02-02',
                    quotation: 'hi'
                }
            ])

            await interactionHandlers.randomHandler(interaction);

            expect(queries.fetchAllQuotes).toHaveBeenCalled();
            expect(interaction.reply).toHaveBeenCalled();
        });

        it('should get a random quote from a specific author if the author is provided', async () => {

            spyOn(interaction.options, 'getString').and.returnValue('Jane');

            spyOn(queries, 'getQuotesFromAuthor').and.returnValue([
                {
                    author: 'jane',
                    said_at: '2022-02-02',
                    quotation: 'hi'
                }
            ])

            await interactionHandlers.randomHandler(interaction);

            expect(queries.getQuotesFromAuthor).toHaveBeenCalled();
            expect(interaction.reply).toHaveBeenCalled();
        });
    });

});
