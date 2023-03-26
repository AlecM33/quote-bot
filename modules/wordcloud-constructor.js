const cloud = require('d3-cloud');
const randomColor = require('randomcolor');

const CONFIG = {
    FONT_SIZE_EXPONENT: 3,
    MIN_FONT_SIZE: 25,
    MAX_FONT_SIZE: 200,
    SIZE_SMALL: 500,
    SIZE_MEDIUM: 1000,
    SIZE_LARGE: 1500,
    WORD_PADDING: 5,
    WORD_ROTATION: 0,
    COLORS: null
};

module.exports = import('d3').then((d3) => {
    return {
        initialize: (wordsWithOccurrences, size) => {
            const wordcloud = cloud();
            CONFIG.COLORS = randomColor({
                luminosity: 'light',
                count: 3
            });
            wordcloud
                .size([CONFIG[size], CONFIG[size]])
                .words(wordsWithOccurrences = wordsWithOccurrences.map(function (d) {
                    return {
                        text: d.word,
                        size: CONFIG.MIN_FONT_SIZE +
                            Math.min(Math.pow(d.frequency, CONFIG.FONT_SIZE_EXPONENT), CONFIG.MAX_FONT_SIZE)
                    };
                }))
                .padding(CONFIG.WORD_PADDING)
                .rotate(CONFIG.WORD_ROTATION)
                .fontSize(function (d) {
                    return d.size;
                });

            return { cloud: wordcloud, words: wordsWithOccurrences, config: CONFIG };
        },

        draw: (wordcloud, words, element) => {
            d3.select(element).append('svg')
                .attr('preserveAspectRatio', 'xMinYMin meet')
                .attr('width', wordcloud.size()[0])
                .attr('height', wordcloud.size()[1])
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('viewBox', '0 0 ' + wordcloud.size()[0] + ' ' + wordcloud.size()[1])
                .append('g')
                .attr('transform', 'translate(' + wordcloud.size()[0] / 2 + ',' + wordcloud.size()[1] / 2 + ')')
                .selectAll('text')
                .data(words)
                .enter().append('text')
                .style('font-size', function (d) {
                    return d.size + 'px';
                })
                .style('font-family', 'Georgia')
                .style('fill', () => {
                    return CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
                })
                .attr('text-anchor', 'middle')
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
                })
                .text(function (d) {
                    return d.text;
                });

            return d3;
        }
    };
});
