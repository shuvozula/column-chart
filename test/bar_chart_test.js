
/**
 * Test suite for ColumnChart.BarChart.
 */
describe('Test Bar-Chart', function() {

    var spyEvent;

	function createFixtures() {
        for (var i = 0; i < 5; i++) {
			d3.select('body').append('div')
                             .attr('class', 'barchart')
                             .attr('data-for-column', 'datacol')
                             .attr('data-bar-value', 10 + i)
                             .attr('data-bar-color', '#CD4876')
                             .attr('data-bar-tooltip-text', 10 + i);
        }
	}

    function tearDownFixtures() {
        $('div.barchart').remove();
        $('svg').remove();
        $('.tooltip').remove();
    }

    function flushAllD3Transitions() {
        var now = Date.now;
        Date.now = function() { return Infinity; };
        d3.timer.flush();
        Date.now = now;
    }

    function d3DispatchEvent(element, eventType) {
        var e = document.createEvent('UIEvents');
        e.initUIEvent(eventType, true, true, window, 1);
        d3.select(element).node().dispatchEvent(e);
    }

	beforeEach(function() {
        createFixtures();
        this.barChartObj = new ColumnChart.BarChart('dummytableid');
	});

	afterEach(function() {
        tearDownFixtures();
	});

	it('tests if the div placeholders are in DOM', function() {
        var divPlaceHolders = $('.barchart');
        expect(divPlaceHolders.length).toBe(5);
	});

	it('tests if SVG elements have correct values/attributes', function() {
        // render the bar charts
        this.barChartObj.renderInlineBarcharts();
        // verify the SVG elements created.
        var allSvgs = $('svg');
        expect(allSvgs.length).toBe(5);
        for (var j = 0; j < allSvgs.length; j++) {
            expect($(allSvgs[j]).text()).toBe((10 + j).toString());
            expect($(allSvgs[j]).children().length).toBe(1);
            expect(d3.select('rect').attr('height')).toBe(
                DEFAULT_HEIGHT.toString());
            expect(d3.select('rect').attr('style')).toContain('opacity: 0.8;');
            expect(d3.select('rect').attr('style')).toMatch(
                /(#cd4876)|(rgb\(205, 72, 118\))/);
        }
    });

    it('test mousover and mousout', function() {
        var toolTip = $('tooltip');
        // render the bar charts
        this.barChartObj.renderInlineBarcharts();
        // trigger mouseover and test state change
        var allSvgs = $('svg');
        var rectElem;
        expect(allSvgs.length).toBe(5);
        for (var k = 0; k < allSvgs.length; k++) {
            rectElem = $(allSvgs[k]).find('>:first-child');
            // test for mouse-over event
            d3DispatchEvent(rectElem[0], 'mouseover');
            flushAllD3Transitions();
            expect($(rectElem).attr('style')).toContain('opacity: 1;');
            expect($('.tooltip').attr('style')).toContain('opacity: 0.9;');
            // test for mouse-out event
            d3DispatchEvent(rectElem[0], 'mouseout');
            flushAllD3Transitions();
            expect($(rectElem).attr('style')).toContain('opacity: 0.8;');
            expect($('.tooltip').attr('style')).toContain('opacity: 0;');
        }
    });

});

