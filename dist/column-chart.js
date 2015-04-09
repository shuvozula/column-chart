/**
 * Namespaces for ColumnChart.
 */

var ColumnChart = ColumnChart || {};

ColumnChart.BarChart = {};
ColumnChart.StackedBarChart = {};



DEFAULT_HEIGHT = 20;



/**
 * Static function to create tooltips for bar-charts
 * @param  {Object} data Contains a .title and .text property to be displayed in
 *                       the tooltip
 * @return {String}      HTML string that will be used to render in the tooltip.
 */
ColumnChart.tooltip = function(data) {
    return '<strong>' + data.title + '</strong>' +
           '<p>' + data.text + '</p>';
};



/**
 * Used by Multi-Bar charts to display legend with show/hide functionality.
 * @constructor
 */
ColumnChart.LegendControls = function() {

    /**
     * D3 dispatcher object to manage event handling
     * @type {d3.dispatch}
     */
    this.dispatch = d3.dispatch('showBar', 'hideBar', 'showOnly', 'resetAll');
};


/**
 * Main entry point to start creating the legends for the Multi-Bar chart.
 * @param {d3.scale.Category10} colorMap Color map scale with column references.
 * @param {Object} svgIds Mapping of legend-title to legend class-id.
 */
ColumnChart.LegendControls.prototype.createLegend = function(
        tableId, colorMap, svgIds) {
    // calculate the hosting table's width so that the legend can be built
    var tableElem = $('#' + tableId);
    var hostingTableWidth = tableElem.width();
    // start building the panel
    var panels = this.addPanel_(tableElem);
    this.addLegend2Panel_(panels, colorMap, svgIds, hostingTableWidth);
    this.addListeners_(panels, colorMap, svgIds);
};


/**
 * Adds the basic SVG panel within a DIV container.
 * @return {Object} Reference to the SVG and the SVG->G container that will have
 *                  all the legend items.
 * @private
 */
ColumnChart.LegendControls.prototype.addPanel_ = function(tableElem) {
    var svgContainer = d3.select('body').append('div')
                                        .attr('class', 'multi-bar-legend')
                                            .append('svg');
    var gContainer = svgContainer.append('g')
                                 .attr('transform', 'translate(0, 20)');
    // add the DIV->SVG container for the panel just before table elem
    $('.multi-bar-legend').insertBefore($(tableElem));
    return {'svgContainer': svgContainer,
            'gContainer': gContainer};
};


/**
 * Adds multiple groups of circle and text elements (i.e. Legend) all positioned
 * next to eachother.
 * @param {object} panels Object containing the SVG & G containers.
 * @param {d3.scale.Category10} colorMap Color map scale with column references.
 * @param {Array.<string>} svgIds Array of SVG class IDs for each rect.
 * @param {Integer} hostingTableWidth Width of the parent/hosting table.
 * @private
 */
ColumnChart.LegendControls.prototype.addLegend2Panel_ = function(
        panels, colorMap, svgIds, hostingTableWidth) {
    var container, circle, text, calcdWidth, currX, prevX, currY, prevY, currSlot;
    var yDiff = 25;
    var colNames = colorMap.domain();
    var leftPadding = 10;
    // fetch the widest legend text length
    var maxLength = 0;
    colNames.forEach(function (colName, i) {
        calcdWidth = getTextWidth(colName) + 70;
        console.log('Calcd. width: ' + calcdWidth);
        maxLength = Math.max(maxLength, calcdWidth);
    });
    console.log('Maxlength: ' + maxLength.toString());
    // loop over each stack in bar and add containers
    currY = 0;
    colNames.forEach(function (colName, i) {
        // calculate where to position each container based on available slots
        if (!currX) {
            currX = 10;
            prevX = 10;
        } else {
            currX = prevX + maxLength;
            if ((currX + maxLength) > hostingTableWidth) {
                currX = 10;
                currY = currY + yDiff;
            }
        }
        // add a circle and text to each container
        container = panels.gContainer.append('g')
                          .attr('class', 'legend-symbol')
                          .attr('toggle', 'show')
                          .attr('xshow', 'false')
                          .attr('transform', 'translate(' + currX + ',' + currY +')');
        container.append('circle')
                 .attr('class', 'legend-symbol-circle')
                 .attr('r', 5)
                 .style({'stroke-width': 2 + 'px',
                         'fill': colorMap(colName),
                         'stroke': colorMap(colName)});
        container.append('text')
                 .attr('class', 'legend-symbol-text')
                 .attr('dy', 0.32 + 'em')
                 .attr('dx', 8)
                 .text(colName);
        prevX = currX;
    });
    var numSlots = Math.floor((hostingTableWidth - leftPadding) / maxLength);
    panels.svgContainer.style('width', (numSlots * maxLength) + 40 + 'px');
    panels.svgContainer.style('height', currY + 40 + 'px');
};


/**
 * Adds the click and double-click listeners to each legend item, so that bars
 * are hidden/shown based on selection.
 * @param {Object} panels Object with reference to the SVG and G containers.
 * @param {d3.scale.category10} colorMap Color map scale with column references.
 * @param {Object} svgIds Mapping of legend-title to legend class-id.
 * @private
 */
ColumnChart.LegendControls.prototype.addListeners_ = function(panels, colorMap, svgIds) {
    var d3Elem, doShow, text, gElem, exclusiveShow;
    var self = this;
    panels.gContainer.selectAll('g')
                     .on('click', function(d) {
                        return self.onSingleClick_(self, this, svgIds);
                     })
                     .on('dblclick', function(d) {
                        return self.onDoubleClick_(self, this, svgIds);
                     });
};


/**
 * Event handler when legend item is single-clicked
 * @param  {Object} dis Reference to the ColumnChart.LegendControls object.
 * @param  {Element} elem <G> element that was clicked.
 * @param  {Object.<String, String>} svgIds Object mapping of SVG Ids to Text.
 * @private
 */
ColumnChart.LegendControls.prototype.onSingleClick_ = function(dis, elem, svgIds) {
    var d3Elem, doShow, text, gElem;
    d3Elem = d3.select(elem);
    text = d3Elem.select('text').html();
    // if xshow is enabled, then just disable it, otherwise
    // continue with hiding/showing all bars corresponding
    // to clicked legend
    if (d3Elem.attr('xshow') == 'true') {
        d3Elem.attr('xshow', 'false');
        $('.legend-symbol').each(function (i, elem) {
            gElem = d3.select(elem);
            if (gElem.select('text').text() != text) {
                gElem.attr('toggle', 'show')
                     .select('circle')
                     .style('fill', gElem.select('circle')
                                         .style('stroke'));
            }
        });
        dis.dispatch.resetAll(elem, getKeyByValue(svgIds, text));
    } else {
        // fetch the stored toggle value and text
        doShow = d3Elem.attr('toggle') == 'show';
        text = d3Elem.select('text').html();
        // show/hide all matching elements with the provided
        // classname in svgIds[text]
        if (doShow) {
           d3Elem.select('circle')
                 .style('fill', 'white');
           dis.dispatch.hideBar(elem, getKeyByValue(svgIds, text));
        } else {
           d3Elem.select('circle')
                 .style('fill', d3Elem.select('circle')
                                      .style('stroke'));
           dis.dispatch.showBar(elem, getKeyByValue(svgIds, text));
        }
        // update the toggle value
        d3Elem.attr('toggle', ((doShow) ? 'hide': 'show'));
    }
};


/**
 * Event handler when legend is double-clicked
 * @param  {Object} dis Reference to the ColumnChart.LegendControls object.
 * @param  {Element} elem <G> element that was clicked.
 * @param  {Object.<String, String>} svgIds Object mapping of SVG Ids to Text
 * @private
 */
ColumnChart.LegendControls.prototype.onDoubleClick_ = function(dis, elem, svgIds) {
    var d3Elem, doShow, text, gElem, exclusiveShow;
    d3Elem = d3.select(elem);
    // fetch the stored xshow value and text
    exclusiveShow = d3Elem.attr('xshow') == 'true';
    text = d3Elem.select('text').html();
    // if exclusive-show is disabled, then enable it by
    // disabling all other legends and then only revealing
    // the bars for the dbl-clicked legend
    if (!exclusiveShow) {
        $('.legend-symbol').each(function (i, elem) {
            gElem = d3.select(elem);
            if (gElem.select('text').text() != text) {
                gElem.attr('toggle', 'hide')
                     .select('circle')
                     .style('fill', 'white');
            } else {
                gElem.attr('toggle', 'show')
                     .select('circle')
                     .style('fill', gElem.select('circle')
                                         .style('stroke'));
            }
        });
        dis.dispatch.showOnly(elem, getKeyByValue(svgIds, text));
        // update the toggle value
        d3Elem.attr('xshow', 'true');
    }
};



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



/**
 * Constructor for the Multi-Bar Inline chart to embed within table TD elements.
 * @param {String} tableID Table-ID to which this multi-bar chart will work on.
 * @constructor
 */
ColumnChart.StackedBarChart = function(tableID) {

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

    /**
     * Legend controls for Multi-bar charts
     * @type {ColumnChart.LegendControls}
     * @private
     */
    this.legendCtrl_ = new ColumnChart.LegendControls();
};


/**
 * Helper method to collect the max column value for each column
 * that is using a Multi-Bar chart
 * @param {Element} divPlaceHolders Place holder DIV elements that contain info
 *                                  for building each SVG container.
 * @private
 */
ColumnChart.StackedBarChart.prototype.getMax_ = function(divPlaceHolders) {
    // loop over each div-placeholder and fetch the max value. This is help
    // scale each bar to the available width in the parent TD element.
    for (var i = 0; i < divPlaceHolders.length; i++) {
        divElem = divPlaceHolders[i];
        colName = divElem.dataset.forColumn;
        if (!(colName in this.maxVal_))
            this.maxVal_[colName] = 0.0;
        this.maxVal_[colName] = Math.max(
                this.maxVal_[colName],
                parseFloat(divElem.dataset.stackedBarCount));
    }
};


/**
 * Assigns the width and x positions of each of the bars.
 * @param {Object} rectVals Object of data for each stacked bar
 * @param {Integer} currColMaxVal The maximum value of the current column.
 * @param {Integer} parentElemWidth Width in pixels of the parent element
 *                                  container.
 * @private
 */
ColumnChart.StackedBarChart.prototype.buildData_ = function(
        rectVals, currColMaxVal, parentElemWidth) {
    var totalWidth = 0;
    rectVals.data.forEach(function (data, j) {
        // assign width
        width = (data.count / currColMaxVal) * parentElemWidth;
        data.width = width;
        totalWidth = totalWidth + width;
        // assign x position
        if (j === 0)
            data.xpos = 0;
        else
            data.xpos = rectVals.data[j - 1].xpos +
                        rectVals.data[j - 1].width;
    });
    return totalWidth;
};


/**
 * Shows a tooltip for Stacked-Bar-Chart for a single stack in the bar.
 * @param {Object} d Data object containing mouse position data.
 * @param {Object} toolTip D3 tooltip showing the value.
 * @private
 */
ColumnChart.StackedBarChart.prototype.onMouseOver_ = function(d, toolTip) {

    d3.select(this).transition().style('opacity', 1);

    toolTip.transition().style('opacity', 0.9);
    toolTip.html(ColumnChart.tooltip({'title': d.col, 'text': this.innerHTML}))
           .style('left', d3.event.pageX + 'px')
           .style('top', (d3.event.pageY - 70) + 'px');
};


/**
 * Hides the tooltip on mouse out over stack in bar-chart.
 * @param {Object} d Datum object.
 * @param {Object} toolTip D3 tooltip object.
 * @private
 */
ColumnChart.StackedBarChart.prototype.onMouseOut_ = function(d, toolTip) {

    d3.select(this).transition().style('opacity', 0.8);
    
    toolTip.transition().style('opacity', 0);
};


/**
 * Main starting point - selects all div info-containers that are placeholders
 * for each of the charts, parses their attribute data-* values to build the
 * SVG bars. Assigns them colors and svg-ids to later be referenced by legend
 * controls to show/hide bars.
 */
ColumnChart.StackedBarChart.prototype.renderInlineBarcharts = function() {

    var divElem, colName, allCols, rectVals, currColMaxVal, parentElem,
        parentElemWidth, totalWidth;
    var svgIds = {};
    var divPlaceHolders = $('StackedBarChart');
    var colorMap_ = d3.scale.category10();
    var toolTip = d3.select('body').append('div')
                                   .attr('class', 'tooltip')
                                   .style('opacity', 0);
    // calculate the max value for each column.
    this.getMax_(divPlaceHolders);
    // loop over each div placeholder for the barchart and insert SVG element to
    // render
    for (var i = 0; i < divPlaceHolders.length; i++) {
        divElem = divPlaceHolders[i];
        colName = divElem.dataset.forColumn;
        rectVals = JSON.parse(divElem.dataset.barValueJson);
        currColMaxVal = this.maxVal_[colName];
        parentElem = $(divElem).parent();
        parentElemWidth = $(parentElem).width();
        // assign x values to each bar based on calculated width
        totalWidth = this.buildData_(rectVals, currColMaxVal, parentElemWidth);
        // apply the color map
        if (colorMap_.domain().length === 0)
            colorMap_.domain(rectVals.cols);
        // set the default sort value to be the total value of all the bars
        parentElem.attr('sorttable_customkey', divElem.dataset.stackedBarCount);
        // append the SVG element to the parent of div
        d3.select(parentElem[0])
            .append('svg')
            .style({'width': parentElemWidth,
                    'height': (this.defaultHeight_ + 2).toString()})
                .append('g')
                .attr('class', 'multibar-container')
                .attr('totalval', divElem.dataset.stackedBarCount)
                .attr('totalwidth', totalWidth)
                .attr('colname', colName)
                .selectAll('rect')
                .data(rectVals.data)
                .enter()
                .append('rect')
                    .text(function (d) { return d.cnt_label; })
                    .attr('class', function(d) { return d.svg_class_id; })
                    .attr('x', function(d) { return d.xpos; })
                    .attr('width', function (d) { return d.width; })
                    .attr('height', this.defaultHeight_.toString())
                    .attr('value', function (d) { return d.count; })
                    .style('fill', function (d) { return colorMap_(d.col); })  // jshint ignore:line
                    .style('opacity', 0.8)
                    .on('mouseover', this.onMouseOver_(d, toolTip))
                    .on('mouseout', this.onMouseOut_(d, toolTip));
        // remove the div element
        $(divElem).remove();
        // collect all the SVG class-IDs for the legend toggles
        if (d3.keys(svgIds).length === 0) {
            rectVals.data.forEach(function (elem) {
                svgIds[elem.svg_class_id] = elem.col;
            });  // jshint ignore:line
        }
    }
    // register all listeners
    this.registerListeners_();
    // add the legend to select/deselect stacked charts
    this.legendCtrl_.createLegend(this.tableID_, colorMap_, svgIds);
};


/**
 * Gets the maximum value of stacked bars in each column. If doExclude is true,
 * then excludes the element with class-name xcludeClsName from the max value.
 * If doExclude is false, then includes the element with class-name
 * xcludeClsName from the max value.
 * @param  {Array.<jquery objects>} allGs Array of all SVG containers.
 * @param  {String} xcludeClsName Class-name to exclude from calculations.
 * @param  {Boolean} doExclude If enabled, then excludes provided xcludeClsName
 *                             from calculations.
 * @return {Object.<String, Integer>} Object of max values keyed by column name.
 */
ColumnChart.StackedBarChart.prototype.getColMax = function(
        allGs, xcludeClsName, doExclude) {
    var maxVals = {}, colVal, d3Elem, colName;
    $(allGs).each(function (i, gContainer) {
        colVal = 0;
        $(gContainer).children('rect').each(function (i, rect) {
            d3Elem = d3.select(rect);
            if (doExclude) {
                if ((!d3Elem.classed(xcludeClsName)) || (!d3Elem.classed('bar-hidden')))
                    colVal += parseFloat(d3.select(rect).attr('value'));
            } else {
                if (d3Elem.classed(xcludeClsName) || (!d3Elem.classed('bar-hidden')))
                    colVal += parseFloat(d3.select(rect).attr('value'));
            }
        });
        colName = d3.select(gContainer).attr('colname');
        if (!(colName in maxVals))
            maxVals[colName] = 0.0;
        maxVals[colName] = Math.max(maxVals[colName], colVal);
    });
    return maxVals;
};


/**
 * Registers 4 listeners with StackedBarChart that listen single and double-clicks
 * to show/hide a stacked bar and show only the double-clicked bar, exactly like
 * NVD3, just crappier.
 * @private
 */
ColumnChart.StackedBarChart.prototype.registerListeners_ = function() {
    var totalVal, totalWidth, barElem, barVal, newWidth, colName;
    var allContainers = $('.multibar-container');
    var self = this;
    // create listener when a certain bar within the stacked bar chart needs
    // to be hidden.
    // TODO: Fix this so that full bar-stack adjusts width upon showing bar.
    this.legendCtrl_.dispatch.on('hideBar', function(clickedElem, className) {
        console.log('Hiding bar: ' + className);

        // get the max val for current column after hiding elements with
        // classname
        maxColVals = self.getColMax(allContainers, className, false);
        // loop over all stacked bar containers
        allContainers.each(function (i, gContainer) {
            gCont = d3.select(gContainer);
            totalWidth = parseFloat(gCont.attr('totalwidth'));
            // loop over each rect and adjust width.
            if (totalWidth > 0) {
                xPos = 0;
                // get width of parent TD element
                parentElemWidth = $(gContainer).parent().parent().width();
                // get details of container
                totalVal = parseFloat(gCont.attr('totalval'));
                colName = gCont.attr('colname');
                // loop over each rect and hide the target bar and re-scale
                // the rest of the bars on available width
                $(gContainer).children('rect').each(function (i, rect) {
                    barElem = d3.select(rect);
                    if (!barElem.classed('bar-hidden')) {
                        if (barElem.classed(className)) {
                            barElem.transition().attr('width', 0);
                            barElem.classed('bar-hidden', true);
                        } else {
                            barVal = parseFloat(barElem.attr('value'));
                            ratio = barVal / maxColVals[colName];
                            ratio = (isNaN(ratio)) ? 0.0 : ratio;
                            newWidth = ratio * parentElemWidth;
                            barElem.transition().attr('width', newWidth);
                            barElem.attr('x', xPos);
                            barElem.classed('bar-hidden', false);
                            xPos += newWidth;
                        }
                    }
                });
            }
        });

        // d3.selectAll('.' + className).classed('bar-hidden', true);
    });
    // listener that shows a stacked bar
    // TODO: Fix this so that full bar-stack adjusts width upon showing bar.
    this.legendCtrl_.dispatch.on('showBar', function (clickedElem, className) {
        console.log('Showing bar: ' + className);
        maxColVals = self.getColMax(allContainers, className, false);
        // loop over all stacked bar containers
        allContainers.each(function (i, gContainer) {
            gCont = d3.select(gContainer);
            totalWidth = parseFloat(gCont.attr('totalwidth'));
            // loop over each rect and adjust width.
            if (totalWidth > 0) {
                xPos = 0;
                // get width of parent TD element
                parentElemWidth = $(gContainer).parent().parent().width();
                // get details of container
                totalVal = parseFloat(gCont.attr('totalval'));
                colName = gCont.attr('colname');
                // loop over each rect and reveal the target bar and re-scale
                // the rest of the bars on available width
                $(gContainer).children('rect').each(function (i, rect) {
                    barElem = d3.select(rect);
                    if (barElem.classed(className))
                        barElem.classed('bar-hidden', false);
                    if (!barElem.classed('bar-hidden')) {
                        barVal = parseFloat(barElem.attr('value'));
                        ratio = barVal / maxColVals[colName];
                        ratio = (isNaN(ratio)) ? 0.0 : ratio;
                        newWidth = ratio * parentElemWidth;
                        barElem.transition().attr('width', newWidth);
                        barElem.attr('x', xPos);
                        xPos += newWidth;
                    }
                });
            }
        });
    });
    // listener that shows only the clicked stacked bar, and hides the rest
    this.legendCtrl_.dispatch.on('showOnly', function (clickedElem, className) {
        console.log('Showing only: ' + className);
        // get the max val of the bar in each container, for the provided
        // className
        var maxVal = 0.0;
        allContainers.each(function (i, gContainer) {
            $(gContainer).children('rect').each(function (i, rect) {
                barElem = d3.select(rect);
                if (barElem.classed(className))
                    maxVal = Math.max(maxVal, parseFloat(barElem.attr('value')));
            });
        });
        var currBarVal, parentElemWidth;
        allContainers.each(function (i, gContainer) {
            parentElemWidth = $(gContainer).parent().width();
            $(gContainer).children('rect').each(function (j, rect) {
                barElem = d3.select(rect);
                if (barElem.classed(className)){
                    currBarVal = barElem.attr('value');
                    // calculate the new width of the bar and align it to x=0
                    newWidth = (currBarVal / maxVal) * parentElemWidth;
                    barElem.attr('x', 0)
                           .transition().attr('width', newWidth);
                    $(rect).closest('td').attr('sorttable_customkey', currBarVal);
                    barElem.classed('bar-hidden', false);
                } else {
                    barElem.classed('bar-hidden', true);
                }
            });
        });
    });
    // listener that resets the view and reveals all bars
    this.legendCtrl_.dispatch.on('resetAll', function (clickedElem, className) {
        console.log('Resetting all b/c u clicked: ' + className);
        var parentElemWidth, totalVal, xPos, barElem, barVal, width;
        allContainers.each(function (i, gContainer) {
            // parentElemWidth = $(gContainer).parent().parent().width();
            svgWidth = parseFloat(d3.select(gContainer).attr('totalwidth'));
            totalVal = parseFloat(d3.select(gContainer).attr('totalval'));
            xPos = 0;
            $(gContainer).children('rect').each(function (j, rect) {
                barElem = d3.select(rect);
                barVal = parseFloat(barElem.attr('value'));
                ratio = (barVal / totalVal);
                ratio = (isNaN(ratio)) ? 0.0 : ratio;
                width = ratio * svgWidth;
                barElem.transition().attr('width', width);
                barElem.attr('x', xPos);
                barElem.classed('bar-hidden', false);
                xPos += width;
            });
            $(gContainer).parent().parent().attr('sorttable_customkey', totalVal);
        });
    });
};

