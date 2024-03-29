/**
 @module charts
 @class Cibi.AreaChart
 */

/**
 `Cibi.AreaChart` is an Ember Object class representing a area chart.

 It contains methods specific to area chart.

 @class Cibi.AreaChart
 @module charts
 */



Cibi.AreaChart = Ember.Object.extend({

  draw: function() {
    var obj = this;
    var filters = obj.chart.getFilters();
    var cds = obj.cds.objectAt(0);
    obj.chart.set('dataLoading', true);
    var chartData = cds.chartData(obj._drawAreaChart, obj, filters);
    obj.chart.set("isSetup", false);
  },

  /**
   This method draws a area chart within the html element specified in configObj.

   @method draw
   */
  _drawAreaChart: function(chartData, obj) {

    var formatDate;
    var parseDate;


    // var formatDate = d3.time.format("%b");
    // var parseDate = d3.time.format("%m").parse;
    var chart = obj.get('chart');

    chart.clearChart();
    var cds = obj.cds.objectAt(0);
    // if(chart.get('sortByKey') == 'true') {
    //   chartData = _.sortBy(chartData, function(d) {
    //       return   sortStringFormat(d.key); // parseInt(d.key.replace(/[A-Za-z\-]/g, ''));
    //   });
    // } else {
    //   chartData = _.sortBy(chartData, function(d) {
    //     return d[cds.get('factDisplay')];
    //       // return d[cds.get('factFormat')+"(`"+cds.get('fact')+"`)"];
    //   });
    // }

    // if(chart.get('descOrder')) {
    //   chartData.reverse();
    // }



    var margin =  {
      top: chart.get('marginTop'),
      right: chart.get('marginRight'),
      bottom: chart.get('marginBottom'),
      left: chart.get('marginLeft'),
    }
    var height = obj.chart.get('height') - margin.top - margin.bottom;
    var width = obj.chart.get('width') - margin.left - margin.right;

    var xValues = chartData.map(function(d) {
      return d.key;
    });
    var max = d3.max(chartData, function(d) {
      return d[cds.get('factDisplay')];
    });
    var min = d3.min(chartData, function(d) {
      return d[cds.get('factDisplay')];
    });

    if(obj.chart.forecast){
      obj.chart.forecast.forEach(function(d) {
        xValues.push(d.key);
      });
      var upperMax=d3.max(obj.chart.forecast, function(d){
        return d.upper;
      });
      max=d3.max([max, upperMax]);
      var lowerMin=d3.min(obj.chart.forecast, function(d){
        return d.lower;
      });
      min=d3.min([min, lowerMin]);
    }

    if(min>0){min=0;}
    var svg   = obj.chart.getSvgElement();
    var yAxis = obj.chart.drawYAxis(svg, [min,max], obj.y_axis_label_right);
    var ymin=yAxis(min);
    if(obj.chart.get('axesConfigsObj')
      && obj.chart.get('axesConfigsObj').yDomainMinValue
      && obj.chart.get('axesConfigsObj').yDomainMaxValue
      && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue
      && obj.chart.get('axesConfigsObj').yDomainMinValue > min)
    {
      ymin=yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue);
    }
    var xAxis = obj.chart.drawXAxis(svg, xValues, ymin);

    var colorScale = obj.chart.colorScale();

    var dimension=cds.get('dimensionName');
    var dimensionFormat=cds.get('dimensionFormatAs');
    var dimensionDataType=cds.get('dataSource').getDataType(dimension);

    formatDate=obj.chart.get('formatDate');
    parseDate=obj.chart.get('parseDate');


    obj.chart.addClipPathElement(svg);

    var area = d3.svg.area()
      .x(function(d) {
        if(obj.chart.get('scale_type')=="time")
        {
          return xAxis((parseDate) ? parseDate(d.key) : d.key);
        }
        else
        {
          return xAxis(d.key)+xAxis.rangeBand()/2;
        }

      })
      .y0(yAxis(0))
      .y1(function(d) {
        return yAxis(d[cds.get('factDisplay')]);
      });

    if(obj.chart.get('scale_type')=="time"){
      area.interpolate("cardinal");
    }
    else if(obj.chart.get('scale_type')=="linear"){
      area.interpolate("linear");
    }
    else{}

    if(chart.get('scale_type')=="time"){
      var formatMoneyText = function(d) {
        var displayFormat=obj.chart.get('axesConfigsObj').yAxisDisplayUnit;
        var value = CommaFormatted(d, displayFormat);
        var factUnit = cds.get('factUnit');
        if (factUnit) {
          if(factUnit['prefix'] == "USD") {
            value = " $ " + value;
          } else if(factUnit['prefix'] == "Rs") {
            value = " ₹ " + value;
          } else if(factUnit['prefix'] == "Euro"){
            value = "€" + value;
          }

          if(factUnit['suffix']){
            value = value + " " + factUnit["suffix"] + " ";
          }
        }
        return value;
      };

      var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "true");

      focus.append("text")
        .attr("class", "y0")
        .attr("dy", "-1em")
        .style("opacity",0);

      svg.append("path")
        .datum(chartData)
        .attr("class", "area")
        .attr("d", area)
        .attr("height", 11)
        .attr("clip-path", obj.chart.getClipPathUrl())
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", function(d) {
          var x_pos = d3.mouse(this)[0],
            y_pos = d3.mouse(this)[1],
            x0 = xAxis.invert(x_pos),
            y0 = yAxis.invert(y_pos),
            display_text = x0.formatDateMonth() + " - " + formatMoneyText(y0);
          focus.select("text.y0").style("opacity", 1);
          focus.select("circle.y0").style("opacity", 1);
          focus.select("text.y0").attr("transform", "translate(" + x_pos + "," + y_pos + ")").text(display_text);
          focus.select("circle.y0").attr("transform", "translate(" + x_pos + "," + y_pos + ")");
        })
        .style("fill", obj.chart.area())
        .style("fill-opacity", 0.7)
        .style("stroke", d3.rgb(obj.chart.area()).darker());

      obj.plotCircles(svg, chartData, xAxis, yAxis, cds, parseDate);

      focus.append("circle")
        .attr("class", "y0")
        .style("fill", "#FFFFFF")
        .style("stroke", "red")
        .attr("r", 4)
        .style("opacity",0);
    }

    if(chart.get('scale_type')=="ordinal"){
      svg.append("path")
        .datum(chartData)
        .attr("class", "area")
        .attr("d", area)
        .attr("height", 11)
        .attr("clip-path", obj.chart.getClipPathUrl())
        .style("fill", obj.chart.area())
        .style("fill-opacity", 0.7)
        .style("stroke", d3.rgb(obj.chart.area()).darker());
      // plot circles
      obj.plotCircles(svg, chartData, xAxis, yAxis, cds, parseDate);
    }

    if(obj.chart.forecast){
      Cibi.Forecast.draw(obj.chart, svg, xAxis, yAxis);
      var colorScale=obj.chart.colorScale();
      colorScale.domain(["Base Line", "Predicted Line", "Lower Bound", "Upper Bound"]);
      colorScale.range([obj.chart.line(),"green","red","blue"]);
      obj.chart.drawChartLegend(["Base Line", "Predicted Line", "Lower Bound", "Upper Bound"], colorScale);
    }
    obj.chart.set('dataLoading', false);
    obj.chart.get('dashboard').highlightFilters();

  },


  /**
   This method plots circles on the area chart.

   @method plotCircles
   */
  plotCircles: function(svg, chartData, xAxis, yAxis, cds, parseDate){
    var obj = this;
    var chart=obj.chart;
    var formatDate=chart.get('formatDate');
    var parseDate=chart.get('parseDate');
    var ordinal_scale = chart.get('scale_type')=="ordinal";
    var highlightRule=chart.get('highlightRule');
    var statsData;
    if(chart.statsData){
      statsData=chart.statsData;
    }
    var tip = obj.chart.getChartTip();

    svg.selectAll("circle")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("id", function(d) {
        return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
      })
      .attr("cx", function(d) {
        if(ordinal_scale) {
          return (xAxis(d.key)+xAxis.rangeBand()/2);
        }
        return xAxis((parseDate) ? parseDate(d.key) : d.key);
      })
      .attr("cy", function(d) {
        if(d[cds.get('factDisplay')] !== undefined) {
          return yAxis(d[cds.get('factDisplay')]);
        }
      })
      .attr("r", function(d) {
        var max_width = 20;
        var w = xAxis.range()[1];
        var r = w > max_width ? max_width : w;
        return r / 5
      })
      .attr("clip-path", obj.chart.getClipPathUrl())
      .style("fill", function(d, i) {
        if(d.to_highlight){
          return d.fill_color;
        }
        return "white";
      })
      .style("stroke", function(d) {
        return "#0000ff";
      })
      .on("mouseover", function(d, i) {
        if(!obj.chart.get('notToHideTip')){
          var otherData={};
          otherData.index=i;
          tip.offset([-10,0]);
          obj.chart.getChartElementData(d,otherData,tip,svg);
          tip.show();
        }
      })
      .on("mouseout", function(){
        if(!obj.chart.get('notToHideTip')){
          tip.hide();
        }
      })
      .on("click", function(d, i) {
        //var rawData = cds.rawData();
        var filter = {};
        filter.dimension = cds.get('dimensionName');
        filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
        filter.value = d.key;

        var otherData={};
        otherData.index=i;

        obj.chart.chartElementOnClick(this.id, filter, d, otherData, tip, svg);

        tip.offset([-10,0]);
      });

    if(highlightRule && highlightRule.get('enable_highlight') && highlightRule.get('enable_sem')) {
      Cibi.ErrorBars.draw(obj.chart, chartData, statsData, svg, xAxis, yAxis);
    }

  }

});