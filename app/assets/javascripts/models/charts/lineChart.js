/**
@module charts
@class Cibi.LineChart
*/

/**
  `Cibi.LineChart` is an Ember Object class representing line chart.

  It contains methods specific to line chart.

  @class Cibi.LineChart
  @module charts
*/
Cibi.LineChart = Ember.Object.extend({
    init: function() {
        if(!this.element) {
            throw new Error("Need to specify element id");
        }
    },

    draw: function() {
        var obj = this;
        var charts_data_sources = obj.chart.get('chartsDataSources');
        var cds = charts_data_sources.objectAt(0);
        var filters = obj.chart.getFilters();
        obj.set('cds_properties', cds.getProperties(["depth", "fact", "dimensionName", "dimensionFormatAs", "factFormat"]));
        obj.chart.set('dataLoading', true);
        if(cds.get('dimensions').get('length')==1 && cds.get('measures').get('length')==1){
          cds.chartData(obj._drawLineChart, obj, filters);
          obj.chart.set("isSetup", false);
        }
        else{
          $("#" + obj.element).html("<div class='alert alert-error'>Improper Configuration</div>");
        }        
    },
    /**
      This method draws a line chart within the html element specified in configObj.

      @method draw
    */

    _drawLineChart: function(data, self) {
        var obj = self;
        
        var formatDate;
        var parseDate;
        var chart = obj.chart;
        chart.clearChart();
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var highlightRule=chart.get('highlightRule');
        var statsData;
        if(chart.statsData){
          statsData=chart.statsData;
        }
        var bisectDate = d3.bisector(function(d) { 
              return (parseDate) ? parseDate(d.key) : d.key; 
        }).left;
        
        var val=cds.get('factDisplay');

        var max = d3.max(data, function(d) {
            return d[val];
        });

        var min = d3.min(data, function(d) {
            return d[val];
        });

        var xValues=new Array();
        
        data.forEach(function(d) {
          xValues.push(d.key);
        });

        if(chart.forecast){
          var upperMax=d3.max(chart.forecast, function(d){
            return d.upper;
          });        
          max=d3.max([max, upperMax]);        
          var lowerMin=d3.min(chart.forecast, function(d){
            return d.lower;
          });            
          min=d3.min([min, lowerMin]);
          chart.forecast.forEach(function(d) {
            xValues.push(d.key);
          });
        }

        if(min>0) { min = 0; }      

        var svg   = obj.chart.getSvgElement();
        var yAxis = obj.chart.drawYAxis(svg, [min,max], obj.y_axis_label);
        var ymin=yAxis(min);
        if(obj.chart.get('axesConfigsObj') 
          && obj.chart.get('axesConfigsObj').yDomainMinValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue > min
          && obj.chart.get('axesConfigsObj').yDomainMaxValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue)
        {
          ymin=yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue);
        }
        var xAxis = obj.chart.drawXAxis(svg, xValues, ymin);
        var dimension=cds.get('dimensionName');
        var dimensionFormat=cds.get('dimensionFormatAs');
        var dimensionDataType=cds.get('dataSource').getDataType(dimension);
        formatDate=obj.chart.get('formatDate');
        parseDate=obj.chart.get('parseDate');
        // if(dimensionDataType=="date"){
        //   if(dimensionFormat=="Year")
        //   {
        //     formatDate=d3.time.format("%Y");
        //     parseDate=d3.time.format("%Y").parse;
        //   }
        //   else if(dimensionFormat=="Month")
        //   {
        //     formatDate = d3.time.format("%b");    
        //     parseDate = d3.time.format("%m").parse;
        //   }
        //   else if(dimensionFormat=="Quarter")
        //   {
        //     formatDate=formatDateAsQuarter;
        //     parseDate=parseDateAsQuarter;
        //   }
        //   else if(dimensionFormat=="Month Year")
        //   {
        //     formatDate = d3.time.format("%Y %b");
        //     parseDate = d3.time.format("%Y %m").parse;
        //   }
        //   else
        //   {
        //     formatDate=d3.time.format("%Y-%m-%d");
        //     parseDate=d3.time.format("%Y-%m-%d").parse;
        //   }
        // }

            var formatDateText = function(d) { return formatDate(parseDate(d.key));},
            formatMoneyText = function(d) {
              var displayFormat=obj.chart.get('axesConfigsObj').yAxisDisplayUnit;
              var value = CommaFormatted(d[val], displayFormat);
              var factUnit = cds.get('factUnit');
              if (factUnit) {
                if(factUnit['prefix'] == "USD") {
                  value = " $ " + value;
                } else if(factUnit['prefix'] == "Rs") {
                  value = " ₹ " + value;
                } else if(factUnit['prefix'] == "Euro"){
                  value = " € " + value;
                }

                if(factUnit['suffix']){
                  value = value + " " + factUnit["suffix"] + " ";
                } 
              }
              return value;            
            };

        var control_mean, stddev, control_count, control_key_found;
        if (obj.control_key && obj.highlight_statistical_relevance)  {         
          var relevanceStats = Cibi.Stats.getRelevanceStats(data, obj.control_key);
          control_mean = relevanceStats["control_mean"];
          stddev = relevanceStats["stddev"];
          control_count = relevanceStats["control_count"];
          control_key_found = relevanceStats["control_key_found"];          
        }

        var tip = obj.chart.getChartTip();

		    var line = d3.svg.line()            
            .x(function(d) { 
                if(obj.chart.get('scale_type')=="time")
                {
                  return xAxis((parseDate) ? parseDate(d.key) : d.key); 
                }
                else
                {
                  return xAxis(d.key)+((obj.chart.get('scale_type')=="ordinal")? xAxis.rangeBand()/2 : 0);
                }    
            })
            .y(function(d) { 
            	if(d[val]) {
            		return yAxis(d[val]);
            	}
            	return yAxis(0);
            });

        if(obj.step_function) {
          line.interpolate("step-after");
        }  
        else {
          if(obj.chart.get('scale_type')=="time")
          {
            line.interpolate("cardinal");  
          }
          else if(obj.chart.get('scale_type')=="linear")
          {
            line.interpolate("linear");
          }
          else
          {

          }      
        }  

        obj.chart.addClipPathElement(svg);

        svg.append("svg:path")
            .attr("d", line(data))
            .attr("clip-path", obj.chart.getClipPathUrl())
            .style("fill", "none")
            .style("stroke", obj.chart.line());

        if(chart.get('scale_type')=="time"){
            var focus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("line")
                .attr("class", "x")
                .attr("y1", yAxis(0) - 6)
                .attr("y2", yAxis(0) + 6);

            focus.append("line")
                .attr("class", "y0")
                .attr("x1", obj.chart.get('width') - 6) 
                .attr("x2", obj.chart.get('width') + 6); 

            focus.append("circle")
                .attr("class", "y0")
                .attr("r", 6);

            focus.append("text")
                .attr("class", "y0")
                .attr("dy", "-1em")
                .style("font-size", "12px");

            svg.append("rect")
              .attr("width", (obj.chart.get('width')-40))
              .attr("height", (obj.chart.get('height')-60))
              .attr("clip-path", obj.chart.getClipPathUrl())
              .on("mouseover", function() { focus.style("display", null); })
              .on("mouseout", function() { focus.style("display", "none"); })
              .on("mousemove", function() {
                  var x_pos = d3.mouse(this)[0],
                  y_pos = d3.mouse(this)[1],
                  x0 = xAxis.invert(x_pos);
                  if(obj.chart.forecast){
                    obj.chart.forecast.forEach(function(d){
                      var json={};
                      json.key=d.key;
                      json[val]=d.mean;
                      data.push(json);
                    });
                  }
                  var i = bisectDate(data, x0, 1);
                  var d0,d1;
                  if(i>0 && i<data.length)
                  {
                    d0 = data[i-1];
                    d1 = data[i];
                  }
                  else if(i>=data.length){
                    d0 = data[data.length-2];
                    d1 = data[data.length-1];
                  }
                  else
                  {
                    d0=data[0];
                    d1=data[1];
                  }              
                  d = x0 - d0[val] > d1[val] - x0 ? d1 : d0;
                  focus.select(".x").attr("transform", "translate(" + (xAxis(parseDate(d.key))) + ",0)");
                  focus.select(".y0").attr("transform", "translate(" + (obj.chart.get('width') * -1) + ", " + yAxis(d[val]) + ")").attr("x2", (obj.chart.get('width') + xAxis(parseDate(d.key))));
                  focus.select("circle.y0").attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d[val]) + ")");
                  focus.select("text.y0").attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d[val]) + ")").text(formatDateText(d)+" - "+formatMoneyText(d));
              })
              .style("fill","none")
              .style("pointer-events","all"); 
        }

        

        // Display Circles

        if(chart.get('scale_type')=="ordinal")
        {
            svg.selectAll("circle")
             .data(data)
             .enter()
             .append("circle")
             .attr("id", function(d) {
              return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
             })
             .attr("cx", function(d) { 
                return xAxis(d.key)+xAxis.rangeBand()/2;            
             })
             .attr("cy", function(d) { 
                if(d[val] || d[val]==0) {
                  return yAxis(d[val]);   
                }
             })
             .attr("r", function(d) {
                var max_width = 40;
                var w = xAxis.rangeBand();
                var r = w > max_width ? max_width : w;
                return r / 10;
             })
             .attr("clip-path", obj.chart.getClipPathUrl())
             .style("fill", function(d, i) {
                if(d.to_highlight){
                  return d.fill_color;
                }
                return obj.chart.line();             
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
            .on("mouseout",function(){
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
              Cibi.ErrorBars.draw(obj.chart, data, statsData, svg, xAxis, yAxis);
            }

        }

        // if(obj.display_error_bars) {
        //   svg.selectAll(".error_bars")
        //     .data(data)
        //     .enter()
        //     .append("svg:line")
        //     .attr("x1", function(d) {
        //       if(d.key) {
        //         var w = (dimensionDataType=="date")?xAxis.range()[1]:xAxis.rangeBand();
        //         return xAxis(d.key) + w / 2; 
        //       }
        //     })
        //     .attr("x2", function(d) {
        //       if(d.key) {
        //         var w = (dimensionDataType=="date")?xAxis.range()[1]:xAxis.rangeBand();
        //         return xAxis(d.key) + w / 2; 
        //       }
        //     })
        //     .style("fill", obj.chart.errorBar())
        //     .style("stroke", obj.chart.errorBar())
        //     .attr("y2", function(d) { 
        //       if(max == 0) {
        //         return 0;
        //       }
        //       var upperBound = d.sem * 1.96;
        //       return yAxis(d[val] - upperBound); 
        //     })
        //     .attr("y1", function(d) { 
        //       if(max == 0) {
        //         return 0;
        //       }
        //       var upperBound = d.sem * 1.96;
        //       return yAxis(d[val] + upperBound); 
        //     })
        //     .on("mouseover", function(d) {
        //       var  key = d.key;
        //       var details="<br>Error Range: "+ d.sem * 1.96 + "/ -" +  d.sem * 1.96 ;
        //       var fact =  cds.get('factDisplay') || cds.get('fact');
        //       var factType =  cds.get('factType')
        //       var factUnit=  cds.get('factUnit')
        //       obj.chart.chartElementOnMouseEnter(key, null, fact, null, details, factType, factUnit);
        //     })
        //     .on("mouseout", function(d) {
        //       obj.chart.chartElementOnMouseExit();
        //     });
        // }
        if(chart.forecast){
          Cibi.Forecast.draw(obj.chart, svg, xAxis, yAxis);
          var colorScale=obj.chart.colorScale();
          colorScale.domain(["Base Line", "Predicted Line", "Lower Bound", "Upper Bound"]);
          colorScale.range([obj.chart.line(),"green","red","blue"]);
          obj.chart.drawChartLegend(["Base Line", "Predicted Line", "Lower Bound", "Upper Bound"], colorScale);
        }
        obj.chart.set('dataLoading', false);
        obj.chart.get('dashboard').highlightFilters();
    },
});
