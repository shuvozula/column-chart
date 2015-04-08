
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

