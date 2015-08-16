/**
@module charts
@class Cibi.ComboChart
*/

/**
  `Cibi.ComboChart` is an Ember Object class for creating combination charts.

  @class Cibi.ComboChart
  @module charts
*/

Cibi.ComboChart = Ember.Object.extend({
  init: function() {
    if(!this.element) {
      throw new Error("Need to specify element id");
    }

        // if(!this.dimensionName) {
        //     throw new Error("Need to specify dimension");
        // }

        this.set("currentFilterKey", null);
    },


  draw: function() {
    var obj = this;
    var cds = obj.chart.get('chartsDataSources').objectAt(0);
    var filters = obj.chart.getFilters();
    obj.chart.set('dataLoading', true);

    cds.chartData(obj._dataCallback, obj, filters);
    var depth = cds.get('depth');
    var depthFormat = cds.get('depthFormat');
    if(depth){
      cds.getUniqueKeys(depth, depthFormat, obj._depthKeysCallback, obj);
    }
  },

  _depthKeysCallback: function(keys, obj) {
      obj.set('uniqueKeys', keys);
      obj.checkDataAndDrawChart();
  },

  checkDataAndDrawChart: function() {
      var obj = this;
      var cds = obj.chart.get('chartsDataSources').objectAt(0);
      var chartDataPresent = obj.get('data');
      var uniqueKeysPresent = obj.get('uniqueKeys');
      var depth = cds.get('depth');
      if(depth){
        if(chartDataPresent && uniqueKeysPresent) {
            var data = this.get('data')
            obj._drawComboChart(data, obj);
        }
      }else {
        if(chartDataPresent) {
            var data = this.get('data')
            obj._drawComboChart(data, obj);
        }
      }
  },     

  _dataCallback: function(data, obj) {
    var cds_data = obj.get('data') || [];
    cds_data.push(data);
    cds_data = _.sortBy(cds_data, function(d) {
      return d.cds_id;
    });
    obj.set('data', cds_data);
    if( cds_data.length == obj.cds.get('length')) {
      obj.checkDataAndDrawChart();
      obj.set('data', null);
    }    
  },
  /**
    This method draws a combo chart within the html element specified in configObj.

    @method draw
  */
  _drawComboChart: function(d, obj) {
        $("#" + this.element).html("");
        var obj = this;
        var max_width = 80;
        var data = obj.get('data');
        var data1 = data[0]; // data1 is bar chart
        var line_data = data[data.length - 1]; // Last Data Source is Always for the line

        var measures = obj.chart.get('measures');

        this.set('fact1', measures.objectAt(0).get('fieldName'));
        this.set('fact2', measures.objectAt(1).get('fieldName'));

        this.set('factType1', measures.objectAt(0).get('formatAs'));
        this.set('factType2', measures.objectAt(1).get('formatAs'));


        var margin = {
                        top: this.chart.get('marginTop'), right: this.chart.get('marginRight'),
                        bottom: this.chart.get('marginBottom'), left: this.chart.get('marginLeft')
                     },
            width = this.chart.get('width') - margin.left - margin.right,
            height = this.chart.get('height') - margin.top - margin.bottom;

        var max1 = 0;
        var depth = this.get('chart').get('chartsDataSources').objectAt(0).get('depth');
        max1 = d3.max(data1, function(d) {
            return d[obj.chart.get('measures').objectAt(0).get('displayName')];
        });

        if(this.get('factType1') == 'percentage') {
          max1 = 100;
        }

        var max2 = d3.max(line_data, function(d) {
            return d[obj.chart.get('measures').get('lastObject').get('displayName')];;
        });

        if(this.get('factType2') == 'percentage') {
          max2 = 100;
        }
        max1 = max1 || 0;
        max2 = max2 || 0;

        var max = max1 > max2 ? max1 : max2;
        // if(this.get('factType1') === this.get('factType2') && this.get('factType2')) {
        //   max1 = max2 = max;
        // }

        var y2 = d3.scale.linear()
            .range([height, 0]);

        var svg = obj.chart.getSvgElement();
        var tip = obj.chart.getChartTip();

        var xValues = data1.map(function(d) {
            return d.key;
        });
        

        var dimension=obj.chart.get('chartsDataSources').objectAt(0).get('dimensionName');
        var dimensionFormat=obj.chart.get('chartsDataSources').objectAt(0).get('dimensionFormatAs');
        var dimensionDataType=obj.chart.get('chartsDataSources').objectAt(0).get('dataSource').getDataType(dimension);
        this.set("dimension",dimension);
        this.set("dimensionFormat",dimensionFormat);
        this.set("dimensionDataType",dimensionDataType);

        var y1 = obj.chart.drawYAxis(svg, [0,max1], obj.y_axis_label_left);
        var x = obj.chart.drawXAxis(svg, xValues,null,'ordinal');
        
        obj.chart.addClipPathElement(svg);

        this.drawBarChart(svg, x, y1, max1, data1, xValues,tip); // draw bar chart

        this.drawLine(svg, x, y2, max2, line_data  , xValues,tip);

        var fact_str1 = measures.objectAt(0).get('displayName') || measures.objectAt(0).get('fieldName');
        var fact_str2 = measures.objectAt(1).get('displayName') || measures.objectAt(1).get('fieldName');
        var colorScale = d3.scale.ordinal()
        .domain([fact_str1, fact_str2])
        .range([obj.chart.bar(), obj.chart.line()]);
        this.chart.drawChartLegend([fact_str1, fact_str2], colorScale);
        obj.chart.set('dataLoading', false);
        obj.chart.get('dashboard').highlightFilters();
  },

    /**
      This method is called from `draw()` to draw line chart over the bar chart to create a combo chart.

      @method drawLine
    */
    drawLine: function(svg, x, y, max, data, xValues,tip) {
      var max_width = 80;

        data = _.filter(data, function(d) {
            return xValues.indexOf(d.key) != -1;
        });

        var obj = this;
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var depth = cds.get('depth');
        var val = obj.chart.get('measures').get('lastObject').get('displayName');
        
        var margin = {
                        top: this.chart.get('marginTop'), right: this.chart.get('marginRight'),
                        bottom: this.chart.get('marginBottom'), left: this.chart.get('marginLeft')
                     },
            width = this.chart.get('width') - margin.left - margin.right,
            height = this.chart.get('height') - margin.top - margin.bottom;

        var dom;
        var formatDate=obj.chart.get('formatDate');
        var parseDate=obj.chart.get('parseDate');
        if(obj.chart.get('axesConfigsObj') 
          && obj.chart.get('axesConfigsObj').rightYDomainMinValue 
          && obj.chart.get('axesConfigsObj').rightYDomainMaxValue          
          && obj.chart.get('axesConfigsObj').rightYDomainMinValue < obj.chart.get('axesConfigsObj').rightYDomainMaxValue){
          if(obj.chart.get('axesConfigsObj').rightYDomainMinValue > 0){
            dom=[obj.chart.get('axesConfigsObj').rightYDomainMinValue,obj.chart.get('axesConfigsObj').rightYDomainMaxValue];
          }
          else{
            dom=[0,obj.chart.get('axesConfigsObj').rightYDomainMaxValue];
          }
        }
        else{
          dom=[0, max];
        }
        var rightYlabel = obj.chart.get('axesConfigsObj').rightYAxisLabel || "";

        y.domain(dom);
        
        var yAxis2 = d3.svg.axis()
            .scale(y)
            .tickFormat(function(d) {
                // var unit = obj.fact2Unit ? obj.fact1Unit : ""
                // return unit + d3.format(",.2s")(d);
                return formatValue(d,((obj.chart.get('axesConfigsObj') && obj.chart.get('axesConfigsObj').rightYAxisDisplayUnit) ? obj.chart.get('axesConfigsObj').rightYAxisDisplayUnit : ""));
            })
            .orient("right");

        svg.append("g")
            .attr("class", "y axis")
            .style('shape-rendering', 'crispEdges')
            .style('fill', 'none')
            .style('stroke', 'black')
            .style("font-weight", "200")
            .attr("transform", "translate("+ width +",0)")
            .call(yAxis2)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 22)
            .attr("x", -height/2)
            .attr("dy", "3em")
            .style("text-anchor", "middle")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
            .style("font-weight", "bold")
            .style("fill", "black")            
            .style("stroke", "none")
            .text((rightYlabel.length > 20) ? rightYlabel.substr(0,20) : rightYlabel)            
            .on("mouseover",function(){
              var div = d3.select("#chart-tooltip");
              div.transition()
              .duration(500)
              .style("opacity", 0.9);
            var html=displayTick(rightYlabel);
            div.html(html)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout",function(){
              obj.chart.chartElementOnMouseExit();
            });             

      svg.selectAll("g.axis")
        .selectAll("text")
        .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
        .style("font-size", "11px")
        .style("letter-spacing", "0px")
        .style("fill", "black")
        .style("stroke", "none");


        svg.selectAll("circle")
         .data(data)
         .enter()
         .append("circle")
         .attr("id", function(d) {
          return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
         })
         .attr("cx", function(d) { 
            return x(d.key) + x.rangeBand() / 2; 
         })
         .attr("cy", function(d) { 
            // var val = d.val; // parseFloat(d3.format(',s')(d.value));
            // return height - val * height / max; 

            if(d[val] || d[val] == 0) {
              return y(d[val]);   
            }

         })
         .attr("r", function(d) {
            var w = x.rangeBand();
            var r = w > max_width ? max_width : w;
            return r / 5
         })
         .attr("clip-path", function(){
          if(obj.chart.get('axesConfigsObj') 
            && obj.chart.get('axesConfigsObj').rightYDomainMinValue
            && obj.chart.get('axesConfigsObj').rightYDomainMaxValue
            && obj.chart.get('axesConfigsObj').rightYDomainMinValue < obj.chart.get('axesConfigsObj').rightYDomainMaxValue){
            return "url(#clip-" + obj.chart.get('elemId') + ")"
          }
          else{
            return "";
          }
        })
        .style("fill", obj.chart.line())
        .style("stroke", d3.rgb(obj.chart.line()).darker())
        .on("mouseover", function(d) { 
          if(!obj.chart.get('notToHideTip')){
            var otherData={};

            var last_measure = obj.chart.get('measures').get('lastObject')
            var fact = last_measure.get('displayName') || last_measure.get('fieldName');
            var factType =  last_measure.get('formatAs');
            var factUnit=  last_measure.get('factUnit');

            otherData.fact=fact;
            otherData.factType=factType;
            otherData.factUnit=factUnit;
            obj.chart.getChartElementData(d,otherData,tip,svg);
            var obj1 = this;
            if(obj1.getBBox().height < height){
                  tip.offset([-10,0]);
            }else{
              tip.offset(function(){
                return [(obj1.getBBox().height-height)-10,0]
              });
            }
            tip.direction("n");
            tip.show();
          }
        })                  
        .on("mouseout",function(){
          if(!obj.chart.get('notToHideTip')){
            tip.hide();
          }
        })
        .on("click", function(d) {
          var filter = {};
          filter.dimension = cds.get('dimensionName');
          filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
          filter.value = d.key;
          
          var otherData={};
          var last_measure = obj.chart.get('measures').get('lastObject')
          var fact = last_measure.get('displayName') || last_measure.get('fieldName');
          var factType =  last_measure.get('formatAs');
          var factUnit=  last_measure.get('factUnit');

          otherData.fact=fact;
          otherData.factType=factType;
          otherData.factUnit=factUnit;

          obj.chart.chartElementOnClick(this.id, filter, d, otherData, tip, svg);
          
          var obj1 = this;
          if(obj1.getBBox().height < height){
                tip.offset([-10,0]);
          }else{
            tip.offset(function(){
              return [(obj1.getBBox().height-height)-10,0]
            });
          }
          tip.direction("n");
        });
        var line = d3.svg.line()
            .interpolate('linear')
            .x(function(d) { 
                return x(d.key) + x.rangeBand() / 2; 
            })
            .y(function(d) { 
                // var val = d.val; //parseFloat(d3.format(',s')(d.value));
                // return height - val * height / max;
                if(d[val] || d[val]==0) {
                  return y(d[val]);
                }
                return 0; 
            });                
        
        svg.append("svg:path")
            .attr("d", line(data))
            .attr("clip-path", function(){
              if(obj.chart.get('axesConfigsObj') 
                && obj.chart.get('axesConfigsObj').rightYDomainMinValue
                && obj.chart.get('axesConfigsObj').rightYDomainMaxValue
                && obj.chart.get('axesConfigsObj').rightYDomainMinValue < obj.chart.get('axesConfigsObj').rightYDomainMaxValue){
                return "url(#clip-" + obj.chart.get('elemId') + ")"
              }
              else{
                return "";
              }
            })
            .style("fill", "none")
            .style("stroke", obj.chart.line());        

    },

    /**
      This method is called from `draw()` to draw bar chart.

      @method drawBarChart
    */
    drawBarChart: function(svg, x, y, max, chartData, xValues,tip) {
      var max_width = 80;
        var obj = this;
        var colorScale = obj.chart.colorScale();
        var margin = {
                        top: this.chart.get('marginTop'), right: this.chart.get('marginRight'),
                        bottom: this.chart.get('marginBottom'), left: this.chart.get('marginLeft')
                     },
            width = this.chart.get('width') - margin.left - margin.right,
            height = this.chart.get('height') - margin.top - margin.bottom;

        var cds = this.chart.get('chartsDataSources').objectAt(0);
        var depth = cds.get('depth');

        var val = obj.chart.get('measures').objectAt(0).get('displayName');

        if (depth) {
          // $("#" + this.element).append("<span class='pull-right'>Stacked <input style=\"margin-top: -2px;\" type='checkbox' id='"+this.element+"-stacked'></input></span>");
          var z = obj.chart.colorScale();
          
          var zKeys = obj.get('uniqueKeys');
          var zKeyCount = zKeys.length;
          var stacked_data = zKeys.map(function(key) {
            return chartData.map(function(d) {
              if(!d.key || !d[val]) {
                return {x: "", y:0};
              }
              var value = d.values.filter(function(v) {
                return v.key == key;
              });
              
              if(value.length > 0) {
                return {x: d.key, key: d.key, value: +value[0][val], y: +value[0][val], zkey: key};  
              }
              return {x: "", y:0};
            });

          });

        
          var data = d3.layout.stack() (stacked_data);

       // Add a group for each zKey.
        var keyGroup = svg.selectAll("g.zKey")
          .data(data)
          .enter().append("svg:g")
          .attr("class", "zKey")
          .style("fill", function(d, i) { 
            return z(i); 
          })
          .style("stroke", function(d, i) { 
            return d3.rgb(z(i)).darker(); 
          });

          // Add a rect for each party.
        var rect = keyGroup.selectAll("rect")
          .data(Object)
          .enter().append("svg:rect")
          .attr("x", function(d) { 
            if(d.key) {
              var x_adj = 0;
              var w = x.rangeBand() ;
              if( w > max_width ) {
                x_adj = (w - max_width) / 2;
              }
              return x(d.key) + x_adj; 

              // var xVal = x(d.key);   
              // if(xVal) {
              //   return xVal;
              // }
            }
          })
          .attr("y", function(d) { 
            // return -height + yAxis(d.y0)+ yAxis(d.y);
            
            if(obj.chart.get('axesConfigsObj') 
                && obj.chart.get('axesConfigsObj').yDomainMinValue
                && obj.chart.get('axesConfigsObj').yDomainMaxValue
                && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue){
              var yVal,
              bar_height = d.y + d.y0;
              if(bar_height > obj.chart.get('axesConfigsObj').yDomainMaxValue || bar_height < obj.chart.get('axesConfigsObj').yDomainMinValue) {
                // Total height of the stack along with current rectangle - is either smaller than the min or bigger than max
                // If it's smaller - we dont want to draw the current rectangle
                // If it's larger - we want to clip the current rectangle at max value
                // Hence in both cases we can safely start drawing at y attr 0 i.e from top of our chart axis
                return 0;
              } else {
                // Remember - we are drawing from top. 
                // i.e yAxis(max) = 0
                // We have to start drawing at the height of the bar
                return y(bar_height); 
              }
            }
            else{
              var yVal =  -height + y(d.y0) + y(d.y); 
              // yVal = yVal || yAxis(d.y); // TODO : Make sure this makes sense
              yVal = yVal || 0;
              return yVal;
            }

          })
          .attr("height", function(d) { 
            if(d.value && d.value > 0) {
              if(obj.chart.get('axesConfigsObj') 
                && obj.chart.get('axesConfigsObj').yDomainMinValue
                && obj.chart.get('axesConfigsObj').yDomainMaxValue
                && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue){
                var bar_height = d.y + d.y0;
                if(bar_height < obj.chart.get('axesConfigsObj').yDomainMinValue ) {
                  // Easy - if bar is shorter than the min of the range - dont draw the bar
                  return 0;
                } else if ( d.y0 > obj.chart.get('axesConfigsObj').yDomainMaxValue ) {
                  // If previous "stack" was larger than the max - then current bar wont be visible. Hence height = 0
                  return 0;
                } else if ( d.y0 == 0 ) {
                  // For the first bar, draw bar proportional to it's value
                  var ret = y(obj.chart.get('axesConfigsObj').yDomainMinValue) - y(d.y);
                  return ret > height ? height : ret ;  
                } else {
                  if (d.y0 < obj.chart.get('axesConfigsObj').yDomainMinValue) {
                    // if previous bar was less than the min. Then we have to clip the current bar at min i.e x axis
                    var ret = height - y(bar_height); 
                    return ret > height ? height : ret ; 
                  } else if ( bar_height > obj.chart.get('axesConfigsObj').yDomainMaxValue ) {
                    // For current bar - we are starting to draw at yAxis(bar height) i.e yAxis(d.y + d.y0)
                    // if bar height is greater than max - we are starting at 0. 
                    // Hence we have to draw untill we reach yAxis(d.y0)
                    return y(d.y0);
                  } else {
                    // if bar height is not greater than zero, then we draw untill we reach d.y0
                    return y(d.y0) - y(bar_height);  
                  }
                }
              }
              else{
               return height - y(d.y);                   
              }              
            }
          })
          .attr("id", function(d) {
            if(d.key) {
              return "chart-" + obj.chart.id + "-" + pruneStr(d.key)  
            }
          })
          .attr("width", function(d) {
            var w = x.rangeBand() ;
            return w > max_width ? max_width: w;
          })
          .attr("clip-path", obj.chart.getClipPathUrl())
          .on("mouseover", function(d) {
            if(!obj.chart.get('notToHideTip')){  
              var otherData={};
              obj.chart.getChartElementData(d,otherData,tip,svg);
              tip.offset([-10,0]);
              tip.show();
            }
          })
          .on("mouseout",function(){
            if(!obj.chart.get('notToHideTip')){
              tip.hide();
            }
          })
          .on("click", function(d) {
            var filterObj=[];
            var filter1 = {};
            filter1.dimension = cds.get('dimensionName');
            filter1.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
            filter1.value = d.key;

            filterObj.push(filter1);
            var filter2={};
            filter2.dimension = cds.get('depth');
            filter2.formatAs = "";
            filter2.value = d.zkey;

            filterObj.push(filter2);

            var otherData={};

            obj.chart.chartElementOnClick(this.id, filterObj, d, otherData, tip, svg);

            tip.offset([-10,0]);
          });

          var label = svg.selectAll("text")
            .data(x.domain())
            .enter()
            .append("svg:text")
            .attr("x", function(d) { 
              return xAxis(d) + xAxis.rangeBand() / 2; 
            })
            .attr("y", 6)
            .attr("text-anchor", "middle")
            .attr("dy", ".71em")
            .text(chartData.map(function(d){ 
              if(d.key) {
                return d.key;  
              } else {
                return "";
              }
            }));

          obj.chart.drawChartLegend(zKeys, z);

          $("#" +this.element+ "-stacked").click(function(e) {
              var rect = svg.selectAll("rect")
              if(e.target.checked) {
                  rect.transition()
                      .attr("x", function(d) {
                          if(d.key) {
                              var xVal = x(d.key);
                              if(xVal) {
                              return xVal;
                          }
                      }
                      })
                      .attr("y", function(d) {
                          var yVal = y(d.y0) - y(d.y);
                          yVal = yVal || - y(d[val]);
                          yVal = yVal || 0;
                          return yVal;
                      })
                      .attr("width", x.rangeBand());
              } else {
                  rect.transition()
                      .delay(function(d, i) { return i * 10; })
                      .attr("height", function(d) {
                          if(d[val] && d[val] > 0) {
                              return y(d[val]);
                          }
                      })
                      .attr("x", function(d, i, j) { 
                          return x(d.x) + (x.rangeBand() / zKeyCount) * Math.floor(i / zKeyCount) ; 
                      })                  
                      .attr("y", function(d) { 
                          var yVal = height - y(d.y);
                          yVal = yVal || 0;
                          return yVal;
                      })
                      .attr("width", x.rangeBand() / zKeyCount);

              }
          });
        }
        else
        {
          var val = obj.chart.get('measures').objectAt(0).get('displayName');
          svg.selectAll(".bar")
            .data(chartData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("clip-path", obj.chart.getClipPathUrl())
            .style('fill', function(d) {
              return obj.chart.bar();
            })
            .style('stroke', function(d) {
              return d3.rgb(obj.chart.bar()).darker();
            })
            .attr("id", function(d) {
              return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
            })
            .attr("x", function(d) { 
              if(d.key) {
                var x_adj = 0;
                var w = x.rangeBand() ;
                if( w > max_width ) {
                  x_adj = (w - max_width) / 2;
                }
                return x(d.key) + x_adj; 
              }
            })
            .attr("width", function(d) {
              var w = x.rangeBand() ;
              return w > max_width ? max_width: w;
            })
            .attr("y", function(d) {
                // return height - height * d.val / max;
                return d[val] < 0 ? Math.abs(y(0)) : y(d[val]);
            })
            .attr("height", function(d) {
                // if(!d.val) {
                //     return 0;
                // }
                // return d.val < 0 ? 0 : height * d.val / max;

                if(d[val]) {
                  if(obj.chart.get('axesConfigsObj') 
                    && obj.chart.get('axesConfigsObj').yDomainMinValue
                    && obj.chart.get('axesConfigsObj').yDomainMaxValue
                    && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue){
                    return Math.abs(y(obj.chart.get('axesConfigsObj').yDomainMinValue))-y(d[val]);
                  }
                  else{
                    return Math.abs(y(0) - y(d[val]));
                  }
                }
            })
            .on("mouseover", function(d) {
              if(!obj.chart.get('notToHideTip')){
                var otherData={};
                obj.chart.getChartElementData(d,otherData,tip,svg);
                var obj1 = this;
                if(obj1.getBBox().height < height){
                      tip.offset([-10,0]);
                }else{
                  tip.offset(function(){
                    return [(obj1.getBBox().height-height)-10,0]
                  });
                }
                tip.direction("n");
                tip.show();
              }
            })
            .on("mouseout",function(){
              if(!obj.chart.get('notToHideTip')){
                tip.hide();
              }
            })
            .on("click", function(d) {
              var filter = {};
              filter.dimension = cds.get('dimensionName');
              filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
              filter.value = d.key;

              var otherData={};
              
              obj.chart.chartElementOnClick(this.id, filter, d, otherData, tip, svg);

              var obj1 = this;
              if(obj1.getBBox().height < height){
                    tip.offset([-10,0]);
              }else{
                tip.offset(function(){
                  return [(obj1.getBBox().height-height)-10,0]
                });
              }
              tip.direction("n");
            });
        }
    },
});