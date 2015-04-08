


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
    var tableElem = $('#' + tableId)
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
                 .attr('dy', .32 + 'em')
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

