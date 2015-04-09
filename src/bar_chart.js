
/**
 * Constructor for Inline Barcharts.
 * @param {Element} tableID Table ID of table where these bar-charts will appear.
 * @constructor
 */
ColumnChart.BarChart = function(tableID) {

    /**
     * Internal reference to the parent table whose TD elements need to be
     * formatted as bar charts (horizontal)
     * @type {Element}
     * @private
     */
    this.tableID_ = tableID;

    /**
     * Default height of each horizontal bar
     * @type {Number}
     * @private
     */
    this.defaultHeight_ = DEFAULT_HEIGHT;

    /**
     * Used for scaling the width of the horizontal bar based on the calculated
     * max-value. Max values are stored as attributes within the object, keyed
     * by the column name.
     * @type {Object}
     * @private
     */
    this.maxVal_ = {};
};


/**
 * Shows a tooltip for barchart.
 * @param {Object} d Datum object containing mouse position values.
 * @param {Object} tooltip D3 tooltip object.
 * @param {String} colName Column name to which this on-mouse-over applies.
 * @private
 */
ColumnChart.BarChart.prototype.onMouseOver_ = function(d, toolTip, colName) {

    d3.select($(this)[0]).transition().style('opacity', 1);
    
    toolTip.transition().style('opacity', 0.9);
    toolTip.html(ColumnChart.tooltip(
            {'title': colName, 'text': this.innerHTML}))
           .style('left', (d3.event.pageX + 20) + 'px')
           .style('top', (d3.event.pageY - 70) + 'px');
};


/**
 * Hides tooltip for barchart on mouse out.
 * @param  {Object} d Data object containing mouse position values.
 * @param  {Object} tooltip D3 tooltip object.
 * @private
 */
ColumnChart.BarChart.prototype.onMouseOut_ = function(d, toolTip) {
    d3.select($(this)[0]).transition().style('opacity', 0.8);
    toolTip.transition().style('opacity', 0);
};


/**
 * Main entry point for Barcharts - Calculates the max value in each column,
 * then looks over each <DIV> placeholder element, extracts all data and then
 * constructs the bars with provided widths, column-name, bar value, etc.
 */
ColumnChart.BarChart.prototype.renderInlineBarcharts = function() {

    var divElem, colName, scaledWidth, parentElem, parentElemWidth;
    var divPlaceHolders = $('.barchart');
    var toolTip = d3.select('body').append('div')
                                   .attr('class', 'tooltip')
                                   .style('opacity', 0);

    // loop over each div-placeholder and fetch the max value. This is help
    // scale each bar to the available width in the parent TD element.
    for (var i = 0; i < divPlaceHolders.length; i++) {
        divElem = divPlaceHolders[i];
        colName = divElem.dataset.forColumn;
        if (!(colName in this.maxVal_))
            this.maxVal_[colName] = 0.0;
        this.maxVal_[colName] = Math.max(this.maxVal_[colName],
                                         parseFloat(divElem.dataset.barValue));
    }

    // loop over each div placeholder for the barchart and insert SVG element to
    // render
    for (var j = 0; j < divPlaceHolders.length; j++) {
        divElem = divPlaceHolders[j];
        colName = divElem.dataset.forColumn;
        parentElem = $(divElem).parent();
        parentElemWidth = $(parentElem).width();
        // calculate the scaled width
        scaledWidth = (divElem.dataset.barValue / this.maxVal_[colName]) * parentElemWidth;
        // append the SVG element to the parent of div
        d3.select(parentElem[0]).append('svg')
            .style({'width': parentElemWidth,
                    'height': (this.defaultHeight_ + 2).toString()})
                .append('rect')
                .text(divElem.dataset.barTooltipText)
                .attr('width', scaledWidth)
                .attr('height', this.defaultHeight_.toString())
                .style('fill', divElem.dataset.barColor)
                .style('opacity', 0.8)
                .on('mouseover', function(d) { 
                    this.onMouseOver_(d, toolTip, colName); })  // jshint ignore:line
                .on('mouseout', function(d) {
                    this.onMouseOut_(d, toolTip); });  // jshint ignore:line
        // remove the div element
        $(divElem).remove();
    }
};

