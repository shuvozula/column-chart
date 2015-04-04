Creates d3 horizontal bar charts within a table column, instead of visualizing
them as numbers. 2 types of charting libraries exist:

1] BarChart
This library can take a column full of numbers and show them as 
horizontal bar-charts. The data needs to be in data-* attributes as stringified
JSON. This library is sorttjs friendly.

2] StackedBarChart
This library can take data that is currently provided as <DIV> placeholders 
marked with class barchart, which contain data in their data-* attributes 
as stringified json. The data is then interpreted and rendered as multi-bar 
charts.