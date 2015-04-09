
/**
 * Test suite for BarChart.
 */
describe('TestBarChart', function() {

	function createFixtures() {
		for (var i = 0; i < 5; i++) {
			d3.select('body').append('div')
                             .attr('class', 'barchart')
                             .attr('data-for-column', 'datacol')
                             .attr('data-bar-value', 10 + i)
                             .attr('data-bar-color', '#CD4876')
                             .attr('data-bar-tooltip-text', 'Foo');
		}
	}

	beforeEach(function() {
        createFixtures();
        this.barChartObj = new ColumnChart.BarChart('dummytableid');
	});

	afterEach(function() {
        $('div.barchart').remove();
	});

	it('testTestDivPlaceHolders', function() {
        var divPlaceHolders = $('.barchart');
        expect(divPlaceHolders.length).toBe(5);
	});

	it('testRenderInlineBarcharts', function() {
        // render the bar charts
        this.barChartObj.renderInlineBarcharts();
        // verify the SVG elements created.
        var allSvgs = $('svg');
        expect(allSvgs.length).toBe(5);
        for (var i = 0; i < allSvgs.length; i++) {
            expect($(allSvgs[i]).text()).toBe('Foo');
            expect($(allSvgs[i]).children().length).toBe(1);
            expect(d3.select('rect').attr('height')).toBe(
                DEFAULT_HEIGHT.toString());
            expect(d3.select('rect').text()).toBe('Foo');
            expect(d3.select('rect').attr('style')).toBe(
                'fill: #cd4876; opacity: 0.8; ');
        }
    });

});