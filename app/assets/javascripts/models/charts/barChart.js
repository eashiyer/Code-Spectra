/**
@module charts
@class Cibi.BarChart
*/

/**
  `Cibi.BarChart` is an Ember Object class representing a bar chart.

  It contains methods specific to bar chart.

  @class Cibi.BarChart
  @module charts
*/



Cibi.BarChart = Ember.Object.extend({

  /**
    `init()` is called automatically when an instance of this class is created with

        Cibi.BarChart.create

    @method init
  */
  init: function() {
    if(!this.element) {
      throw new Error("Need to specify element id");
    }

        // if(!this.dimensionName) {
        //     throw new Error("Need to specify dimension");
        // }

        if(this.stacked && !this.depth) {
          throw new Error("Need to specify depth for Stacked Graph");
        }
        this.set("currentFilterKey", null);
    },

    draw: function() {
        var obj = this;

        var charts_data_sources = obj.chart.get('chartsDataSources');        
        var filters = obj.chart.getFilters();
        var measures = obj.chart.get('measures');
        var cds = charts_data_sources.objectAt(0);
        if(measures.get('length') == 1) {            
          obj.set('cds_properties', cds.getProperties(["depth", "fact", "dimensionName", "dimensionFormatAs", "factFormat"]));
          obj.chart.set('dataLoading', true);
          cds.chartData(obj._chartDataCallback, obj, filters);
          var depth = cds.get('depth');
          var depthFormat = cds.get('depthFormat');
          // if(depth){
          //   obj._depthKeysCallback(obj.get('depth_unique_values'), obj);
          // }
        } else {       
          obj.chart.set('dataLoading', true);
          cds.chartData(obj._dataCallback, obj, filters);
        }
    },

    _chartDataCallback: function(data, obj) {
        obj.set('chartData', data);
        obj.set('uniqueKeys', obj.chart.get('depth_unique_values'));
        obj.checkDataAndDrawChart();
    },

    _depthKeysCallback: function(keys, obj) {
        obj.set('uniqueKeys', keys);
        obj.checkDataAndDrawChart();
    },

    checkDataAndDrawChart: function() {
        var obj = this;
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var chartDataPresent = obj.get('chartData');
        var uniqueKeysPresent = obj.get('uniqueKeys');
        var depth = cds.get('depth');
        if(depth){
          if(chartDataPresent && uniqueKeysPresent) {
              var data = this.get('chartData')
              obj._drawSimpleBarChart(data, obj);
          }
        }else {
          if(chartDataPresent) {
              var data = this.get('chartData')
              obj._drawSimpleBarChart(data, obj);
          }
        }
    },

    _dataCallback: function(data, obj) {
      var cds_data = obj.get('data') || [];
      var keys = obj.get('keys') || [];
      keys.push(data.map(function(dat) {
        return dat.key; 
      }))
      cds_data.push(data);
      cds_data = _.sortBy(cds_data, function(d) {
        return d.cds_id;
      });
      obj.set('data', cds_data);
      obj.set('keys', keys)
        obj._drawGrouped();
        obj.set('data', []);
        obj.set('keys', []);
      
    },

    /**
      This method draws a bar chart within the html element specified in configObj.

      It draws simple bar chart or stacked or grouped bar chart depending on the configuration passed to it.
      Stacked bar chart requires `depth` to be specified. If it is not passed then simple bar chart is drawn.
      If there are more than one `charts_data_source`(cds) for the chart, then grouped chart is rendered.

      The charts are rendered using d3.js.

      @method draw
    */

    _drawSimpleBarChart: function(chartData, self) {
      var obj = self;
      $("#" + obj.element).html("");
      var legendFilter = obj.chart.get('legendFilter');
      legendFilter = legendFilter ? legendFilter.index : legendFilter;
      var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;
      var filters = obj.chart.getFilters();
      var chart = obj.get('chart');
      chart.clearChart();
      var formatDate;
      var parseDate;
      var cds = obj.cds;
      var max_width = 80;
      var configsYMax = chart.get('axesConfigsObj').yDomainMaxValue || 0;

      var highlightRule=chart.get('highlightRule');
      var statsData;
      if(chart.statsData){
        statsData=chart.statsData;
      }
      var measures = obj.chart.get('measures');
      var val=measures.objectAt(0).get('displayName');
      // var val = measures.objectAt(0).get('formatAs')+"(`"+measures.objectAt(0).get('fieldName')+"`)";
      if(measures.get('length') == 1) {
        // if(chart.get('sortByKey') == 'true') {
        //   chartData = _.sortBy(chartData, function(d) {
        //       return   sortStringFormat(d.key); // parseInt(d.key.replace(/[A-Za-z\-]/g, ''));
        //   });
        // } else {
        //   chartData = _.sortBy(chartData, function(d) {
        //       return d[val];
        //   });          
        // }
        // if(chart.get('descOrder')) {
        //   chartData.reverse();
        // }
      } else {
        obj.drawGrouped();
        return;
      }
      
      var factType = chartData.get('factType');
      var factUnit = chartData.get('factUnit');
      var margin =  {
                      top: chart.get('marginTop'), 
                      right: chart.get('marginRight'), 
                      bottom: chart.get('marginBottom'),  
                      left: chart.get('marginLeft'), 
                    },
      width = chart.get('width') - margin.left - margin.right,
      height = chart.get('height') - margin.top - margin.bottom;


      var xValues = chartData.map(function(d) {
        return d.key;
      });

      // xValues = _.sortBy(xValues, function(d) {
      //   return d;
      // });

      var max = d3.max(chartData, function(d) { return d[val]; });
      var min = d3.min(chartData, function(d) { 
        return d[val]; 
      });
      // min = min < 0 ? min : 0;
      if(min>0){min=0;}
      var svg   = obj.chart.getSvgElement();

      var chartHeight = obj.chart.get('dashboard').getBlockHeight();
      var tip = obj.chart.getChartTip();
      
      var colorScale = obj.chart.colorScale(); 

          
      var depth = obj.chart.get('chartsDataSources').objectAt(0).get('depth');
      if (depth) {
       // $("#" + this.element).append("<span class='pull-right'>Stacked <input style=\"margin-top: -2px;\" type='checkbox' checked=true id='"+this.element+"-stacked'></input></span>");
        var cds = cds.objectAt(0);
        var z = colorScale;
        var fact = cds.get('fact');
        var zKeys = obj.get('uniqueKeys');
        var orgzKeys=obj.chart.get('original_zkeys');
        var zKeyCount = zKeys.length;
      
       if(orgzKeys){
            z.domain(orgzKeys);
        }else{
            z.domain(zKeys);
        }
        if(isValidLegendFilter) {
          var key = zKeys[legendFilter];
          var stacked_data = [];
          var cd =  chartData.map(function(d) {
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
          stacked_data.push(cd);

          var max = d3.max(cd, function(d) { return d.value; });
          var min = d3.min(cd, function(d) { 
            return d.value; 
          });
          if(min>0){min=0;}
        } else {
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
        }
        var yAxis = obj.chart.drawYAxis(svg, [min,max], obj.y_axis_label);
        var ymin=yAxis(min);
        if(obj.chart.get('axesConfigsObj') 
          && obj.chart.get('axesConfigsObj').yDomainMinValue
          && obj.chart.get('axesConfigsObj').yDomainMaxValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue > min)
        {
          var min = obj.chart.get('axesConfigsObj').yDomainMinValue,
          max = obj.chart.get('axesConfigsObj').yDomainMaxValue || max;

          ymin=yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue);
        }
        var xAxis = obj.chart.drawXAxis(svg, xValues,ymin,'ordinal');
        formatDate=obj.chart.get('formatDate');
        parseDate=obj.chart.get('parseDate');
        var data = d3.layout.stack() (stacked_data);

        // data = _.sortBy(data, function(d) {
        //   return d.key;
        // });

        var pruned_data = data[0].map(function(d) { 
          if(d.key) {
            return d.key;
          }
        });

        // pruned_data = _.sortBy(pruned_data, function(d) {
        //   return d;
        // })

        obj.chart.addClipPathElement(svg);

       
       // Add a group for each zKey.
        var keyGroup = svg.selectAll("g.zKey")
          .data(data)
          .enter().append("svg:g")
          .attr("class", "zKey")
          .attr("clip-path", obj.chart.getClipPathUrl())
          .style("fill", function(d, i) { 
              for (var j = 0; j < d.length; j++) {
                if(d[j].zkey){
                 return z(d[j].zkey);
                }
              }  
          })
          .style("stroke", function(d, i) { 
              for (var k = 0; k < d.length; k++) {
                if(d[k].zkey){
                  return d3.rgb(z(d[k].zkey)).darker();
                }
              }  
          });
          // console.log(Object);
          // Add a rect for each party.
        var rect = keyGroup.selectAll("rect")
          .data(Object)
          .enter()
          .append("svg:rect")
          .attr("x", function(d) { 
            if(d.key) {
              var x_adj = 0;
              var w = xAxis.rangeBand() ;
              if( w > max_width ) {
                x_adj = (w - max_width) / 2;
              }
              return xAxis(d.key) + x_adj; 
            }
          })
          .attr("y", function(d) { 
            var yVal,
            bar_height = d.y + d.y0;
            if(bar_height > max || bar_height < min) {
              // Total height of the stack along with current rectangle - is either smaller than the min or bigger than max
              // If it's smaller - we dont want to draw the current rectangle
              // If it's larger - we want to clip the current rectangle at max value
              // Hence in both cases we can safely start drawing at y attr 0 i.e from top of our chart axis
              return 0;
            } else {
              // Remember - we are drawing from top. 
              // i.e yAxis(max) = 0
              // We have to start drawing at the height of the bar
              return yAxis(bar_height); 
            }
          })
          .attr("height", function(d) { 
            if(d.value && d.value > 0) {
              var bar_height = d.y + d.y0;
              if(bar_height < min ) {
                // Easy - if bar is shorter than the min of the range - dont draw the bar
                return 0;
              } else if ( d.y0 > max ) {
                // If previous "stack" was larger than the max - then current bar wont be visible. Hence height = 0
                return 0;
              } else if ( d.y0 == 0 ) {
                // For the first bar, draw bar proportional to it's value
                var ret = yAxis(min) - yAxis(d.y);
                return ret > height ? height : ret ;  
              } else {
                if (d.y0 < min) {
                  // if previous bar was less than the min. Then we have to clip the current bar at min i.e x axis
                  var ret = height - yAxis(bar_height); 
                  return ret > height ? height : ret ; 
                } else if ( bar_height > max ) {
                  // For current bar - we are starting to draw at yAxis(bar height) i.e yAxis(d.y + d.y0)
                  // if bar height is greater than max - we are starting at 0. 
                  // Hence we have to draw untill we reach yAxis(d.y0)
                  return yAxis(d.y0);
                } else {
                  // if bar height is not greater than zero, then we draw untill we reach d.y0
                  return yAxis(d.y0) - yAxis(bar_height);  
                }
              }
              //height - yAxis(d.y);
            }
            //   if(obj.chart.get('axesConfigsObj') && obj.chart.get('axesConfigsObj').yDomainMaxValue)
            //   {
            //     if(d.y0 > obj.chart.get('axesConfigsObj').yDomainMaxValue || d.y < obj.chart.get('axesConfigsObj').yDomainMinValue){
            //       return 0;  
            //     }
            //     else{
            //       return height- yAxis(d.y);
            //     }
            //   }else{
            //     return height - yAxis(d.y);
            //   }                
            // }
          })
          .attr("id", function(d) {
            if(d.key) {
              return "chart-" + obj.chart.id + "-" + pruneStr(d.key)+"-"+pruneStr(d.zkey);  
            }
          })
          .attr("width", function(d) {
            var w = xAxis.rangeBand() ;
            return w > max_width ? max_width: w;
          })
          .attr("clip-path", obj.chart.getClipPathUrl())
          .on("mouseover", function(d) {
             if(!obj.chart.get('notToHideTip')){
              var otherData={};
              obj.chart.getChartElementData(d,otherData,tip,svg);
              var obj1 = this;
              if(configsYMax < (d.y+d.y0) && configsYMax != 0){
                var diffrence =(d.y+d.y0) - configsYMax;
                  tip.offset(function(){
                    return [(height-yAxis(diffrence))-5,0]
                  });       
              }else{
                    tip.offset([-10,0]);
              }
              // tip.style('width','300px')
              tip.direction("n");
              tip.show();
            }
            // obj.chart.chartElementOnMouseEnter(d, otherData);
          })
          .on("mouseout",function(){
            if(!obj.chart.get('notToHideTip')){
              tip.hide();
            }
          })
          .on("click", function(d) {
              //var rawData = cds.rawData();
              var filterObj=[];
              var filter1 = {};
              filter1.dimension = cds.get('dimensionName');
              filter1.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
              filter1.value = d.key;

              filterObj.push(filter1);
              var filter2={};
              filter2.dimension = cds.get('depth');
              filter2.formatAs = cds.get('depthFormat') ? cds.get('depthFormat') : "";
              filter2.value = d.zkey;

              filterObj.push(filter2);

              var otherData={};
              
              obj.chart.chartElementOnClick(this.id, filterObj, d, otherData, tip, svg);
             
              var obj1 = this;
              if(configsYMax < (d.y+d.y0) && configsYMax != 0){
                var diffrence =(d.y+d.y0) - configsYMax;
                  tip.offset(function(){
                    return [(height-yAxis(diffrence))-5,0]
                  });       
              }else{
                    tip.offset([-10,0]);
              }
              // tip.style('width','300px')
              tip.direction("n");
          });

          obj.chart.drawChartLegend(zKeys, z, true);
      } else {
        var data = chartData;
        if(obj.control_key ) {
            var control_mean, control_stddev, control_count, control_key_found, control_sem;
            var relevanceStats = Cibi.Stats.getRelevanceStats(chartData, obj.control_key);
            control_mean = relevanceStats["control_mean"];
            control_stddev = relevanceStats["control_stddev"];
            control_count = relevanceStats["control_count"];
            control_sem = relevanceStats["control_sem"];
            control_val = relevanceStats["control_val"];
            control_key_found = relevanceStats["control_key_found"];

            if(control_key_found && obj.highlight_statistical_relevance) {
                var upperBound = control_mean + control_sem * 1.96;
                var lowerBound = control_mean - control_sem * 1.96;

                svg.append("svg:line")
                  .attr("stroke-dasharray", "5,5")
                  .attr("y1", height - (height * upperBound) / max)
                  .attr("x2", width)
                  .attr("y2", height - (height * upperBound) / max)
                  .attr("clip-path", obj.chart.getClipPathUrl())
                  .style("stroke", "red");

                svg.append("svg:line")
                  .attr("stroke-dasharray", "5,5")
                  .attr("y1", height - (height * lowerBound) / max)
                  .attr("x2", width)
                  .attr("y2", height - (height * lowerBound) / max)
                  .attr("clip-path", obj.chart.getClipPathUrl())
                  .style("stroke", "red");  

                var arr = ["Control Key", "Statistically Irrelevant", "Statistically Relevant", "Error Range"];
                var colorScale = d3.scale.ordinal()
                                  .range([obj.chart.controlKey(), 
                                    obj.chart.bar(),
                                    obj.chart.statisticalRelevance(), 
                                    obj.chart.errorBar()])
                                  .domain(arr);
                obj.chart.drawChartLegend(arr, colorScale);
            }

            if(control_key_found && obj.plot_pc) {
                _.each(chartData, function(d) {
                    d[val] = (d[val] - control_val ) * 100 / control_val;
                });
            }
        }
        
        if(obj.plot_abs_values) {
            _.each(chartData, function(d) {
                d[val] = Math.abs (d[val]);
            });
        }
        
        max = d3.max(chartData, function(d) { return d[val]; });
        min = d3.min(chartData, function(d) { 
          return d[val]; 
        });
        max = max < 0 ? 0 : max;
        min = min > 0 ? 0 : min;

        if(min!=0){
          min=min-Math.abs((Math.abs(max)-Math.abs(min))/10);
        }
        
        var yAxis = obj.chart.drawYAxis(svg, [min,max], obj.y_axis_label);
        
        var ymin=yAxis(min);
        if(obj.chart.get('axesConfigsObj') 
          && obj.chart.get('axesConfigsObj').yDomainMinValue
          && obj.chart.get('axesConfigsObj').yDomainMaxValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue > min)
        {
          ymin=yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue);
        }

        var xAxis = obj.chart.drawXAxis(svg, xValues,ymin,'ordinal');
        formatDate=obj.chart.get('formatDate');
        parseDate=obj.chart.get('parseDate');

        obj.chart.addClipPathElement(svg);

        var rect = svg.selectAll(".bar")
          .data(data)
          .enter()
          .append("svg:rect")
          .attr("class", "bar")
          .style('fill', function(d, i) {
              if(d.to_highlight){
                return d.fill_color;
              }
              return obj.chart.bar();
          })          
          .style("stroke", function(d, i) { 
            var color = obj.chart.bar();
            if(d.to_highlight){
              return d.fill_color;
            }
            return d3.rgb(color).darker(); 
          })

          .attr("id", function(d) {
            return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
          })
          .attr("x", function(d) { 
            var x_adj = 0;
            var w = xAxis.rangeBand();
            if( w > max_width ) {
              x_adj = (w - max_width) / 2;
            }
            return xAxis(d.key) + x_adj; 
          })
          .attr("width", function(d) {
            var w = xAxis.rangeBand() ;
            return w > max_width ? max_width : w;
          })
          .attr("y", function(d) { 
             return d[val] < 0 ? yAxis(0) : yAxis(d[val]);
          })
          .attr("height", function(d) { 
            if(d[val]) {
              if(obj.chart.get('axesConfigsObj') 
                && obj.chart.get('axesConfigsObj').yDomainMinValue
                && obj.chart.get('axesConfigsObj').yDomainMaxValue
                && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue
                && obj.chart.get('axesConfigsObj').yDomainMinValue > min
                && !(obj.chart.get('axesConfigsObj').yDomainMinValue<0 && obj.chart.get('axesConfigsObj').yDomainMaxValue>0)){
                  if(obj.chart.get('axesConfigsObj').yDomainMinValue<0 && obj.chart.get('axesConfigsObj').yDomainMaxValue<0){
                    if(d[val]>0){
                      return 0;
                    }
                    else{
                      return Math.abs(yAxis(0)-yAxis(d[val]));
                    }
                  }
                  else{
                    return Math.abs(yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue))-yAxis(d[val]);
                  }
                }
              else{
                return Math.abs(yAxis(0) - yAxis(d[val]));
              }
            }
          })
          .attr("clip-path", obj.chart.getClipPathUrl())
          .on("mouseover", function(d, i) {   
            if(!obj.chart.get('notToHideTip')){  
              var details;
              if(obj.display_rank) {
                details= "Rank : " + d.rank;
              }
              var otherData={};
              otherData.index=i;
              otherData.details=details;
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
          .on("click", function(d, i) {
            var details;
            if(obj.display_rank) {
              details= "Rank : " + d.rank;
            }
            var otherData={};
            otherData.index=i;
            otherData.details=details;

            var cds = obj.cds.objectAt(0);
            //var rawData = cds.rawData();
            var filter = {};
            filter.dimension = cds.get('dimensionName');
            filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
            filter.value = d.key;
            
            obj.chart.chartElementOnClick(this.id, filter, d, otherData, tip, svg);

            var obj1 = this;
            if(obj1.getBBox().height < height){
                  tip.offset([-10,0])
            }else{
              tip.offset(function(){
                return [(obj1.getBBox().height-height)-10,0];
              });
            }

            // tip.style('width','300px');
            tip.direction("n");
            // tip.show();
            
          });
        // if(obj.display_error_bars) {
        //   svg.selectAll(".error_bars")
        //     .data(data)
        //     .enter()
        //     .append("svg:line")
        //     .attr("x1", function(d) {
        //       if(d.key) {
        //         var x_adj = 0;
        //         var w = xAxis.rangeBand() ;
        //         if( w > max_width ) {
        //           x_adj = (w - max_width) / 2;
        //         }
        //         return xAxis(d.key) + w / 2; 
        //       }
        //     })
        //     .attr("x2", function(d) {
        //       if(d.key) {
        //         var x_adj = 0;
        //         var w = xAxis.rangeBand() ;
        //         if( w > max_width ) {
        //           x_adj = (w - max_width) / 2;
        //         }
               
        //         return xAxis(d.key) + w / 2; 
        //       }
        //     })
        //     // .attr("width", function(d) {
        //     //   var w = xAxis.rangeBand() ;
        //     //   return w > max_width ? max_width : w;
        //     // })
        //     .style("fill", obj.chart.errorBar())
        //     .style("stroke", obj.chart.errorBar())
        //     .attr("y2", function(d) { 
        //       if(max == 0) {
        //         return 0;
        //       }
        //       var upperBound = d.sem * 1.96;
        //       return height - height * ( d[val] - upperBound) / max ; 
        //       //return height * d.sem * 2 * 1.96 / max;
        //     })
        //     .attr("y1", function(d) { 
        //       if(max == 0) {
        //         return 0;
        //       }
        //       var upperBound = d.sem * 1.96;
        //       return height - height * ( d[val] + upperBound) / max ; 
        //     })
        //     .on("mouseover", function(d) {
        //       var formatDate=obj.chart.get('formatDate');
        //       var parseDate=obj.chart.get('parseDate');
        //       var  key = d.key;
        //       var details="Error Range: "+ d.sem * 1.96 + "/ -" +  d.sem * 1.96 ;
        //       var cds = obj.cds.objectAt(0);
        //       var fact =  cds.get('factDisplay') || cds.get('fact');
        //       var factType =  cds.get('factType')
        //       var factUnit=  cds.get('factUnit')
        //       obj.chart.chartElementOnMouseEnter(key, null, fact, null, details, factType, factUnit);
        //     })
        //     .on("mouseout", function(d) {
        //       obj.chart.chartElementOnMouseExit();
        //     });
        // }

        if(highlightRule && highlightRule.get('enable_highlight') && highlightRule.get('enable_sem')) {          
          Cibi.ErrorBars.draw(obj.chart, chartData, statsData, svg, xAxis, yAxis);
        }
          
      }
      obj.chart.set('dataLoading', false);
      obj.chart.get('dashboard').highlightFilters();
  },

  /**
    This method is called from `draw()` to draw grouped bar chart.

    refer: https://gist.github.com/mbostock/3887051    

    @method drawGrouped
  */
  _drawGrouped: function() {
    var obj = this;
    
    var chart = obj.get('chart');
    var formatDate;
    var parseDate;
    var legendFilter = obj.chart.get('legendFilter');
    legendFilter = legendFilter ? legendFilter.index : legendFilter;
    var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;
    $("#" + obj.element).html("");
    var cds = obj.cds;

    var arr = [];
    var legend_arr = [];
    
    var measures = obj.chart.get('measures');
    for(i = 0; i < measures.get('length'); i++) {
      arr.push(measures.objectAt(i).get('fieldName'));
      legend_arr.push(measures.objectAt(i).get('displayName') || measures.objectAt(i).get('fieldName'));
    }

    var dataArray = obj.get('data');
    var keysArray = obj.get('keys');
    var data = dataArray;
    var keys = keysArray || [];
    // dataArray.forEach(function(cd, i) {
    //   if( isValidLegendFilter && i != legendFilter) {
    //     return;
    //   }
    //   var d = cd;
    //   // if(chart.get('descOrder')) {
    //   //   d.reverse();
    //   // }
    //   data.push(d);
    //   keys.push(d.map(function(dat) {
    //     return dat.key; 
    //   }))
    // });

    // Get only the common x axis values
    var xValues = keys[0];
    for(var i = 1; i < keys.length; i++) {
      xValues = _.intersection(xValues, keys[i]);
    }

    var filtered_data = [];
    _.each(data, function(d, i) {
      d = _.filter(d, function(x) {
        return xValues.indexOf(x.key) != -1;
      });
      filtered_data.push(d);
    });
    var data = filtered_data;
    var max = 0;
    _.each(data, function(d) {
      var l_max = d3.max(d, function(dat) { 
        var fact_keys = [];
          measures.forEach(function(m){
            fact_keys.push(dat[m.get('displayName')]);
          });
          return d3.max(fact_keys);
       });
      max = max > l_max ? max : l_max;
    });

    var min = 0;
    _.each(data, function(d) {
      var l_min = d3.min(d, function(dat) { 
        var fact_keys = [];
          measures.forEach(function(m){
            fact_keys.push(dat[m.get('displayName')]);
          });
          return d3.min(fact_keys);
       });
      min = min < l_min ? min : l_min;
    });

    max = max < 0 ? 0 : max;
    min = min > 0 ? 0 : min;

    if(min!=0){
      min=min-Math.abs((Math.abs(max)-Math.abs(min))/10);
    }
    
    var chartData = _.flatten(data);

    // if(chart.get('sortByKey') == 'true') {
    //   xValues = _.sortBy(xValues, function(d) {
    //       return   sortStringFormat(d); // parseInt(d.key.replace(/[A-Za-z\-]/g, ''));
    //   });
    //   chartData = _.sortBy(chartData, function(d) {
    //       return   sortStringFormat(d.key); // parseInt(d.key.replace(/[A-Za-z\-]/g, ''));
    //   });
    // } else {
    //   chartData = _.sortBy(chartData, function(d) {
    //       return   d.key; // parseInt(d.key.replace(/[A-Za-z\-]/g, ''));
    //   });      
    // }



    var height = obj.chart.get('height') - obj.chart.get('marginBottom') - obj.chart.get('marginTop');
    var svg   = obj.chart.getSvgElement();    
    var yAxis = obj.chart.drawYAxis(svg, [min,max], obj.y_axis_label);
    var xAxis = obj.chart.drawXAxis(svg, xValues, null, 'ordinal');
    formatDate=obj.chart.get('formatDate');
    parseDate=obj.chart.get('parseDate');
    var colorScale = obj.chart.colorScale().domain(arr);
    var chartHeight = obj.chart.get('dashboard').getBlockHeight(); 

    obj.chart.addClipPathElement(svg);

    var tip = obj.chart.getChartTip();

    var measures_length = measures.get('length');

    measures.forEach(function(m,i){
      if( isValidLegendFilter && i != legendFilter) {
         return;
      }
      var val = m.get('displayName');
      svg.selectAll(".bar"+i)
            .data(chartData)
            .enter()
            .append("rect")
            .attr("class", "bar "+i)
            .style('fill', function(d) {
              var n = i % measures_length;
              if(isValidLegendFilter) {
                n = parseInt(legendFilter);
              } 
              return colorScale(arr[n]);
            })            
            .attr("id", function(d) {
              var n = i % measures_length;
              return "chart-" + obj.chart.id + "-" + pruneStr(d.key) + "-" + n;
            })
            .attr("x", function(d) { 
              var n = i % measures_length;
              var width = xAxis.rangeBand() / measures_length;
              return xAxis(d.key) + n * width; 
            })
            .attr("width", xAxis.rangeBand() / measures_length)
            .attr("y", function(d) { 
              return d[val] < 0 ? yAxis(0) : yAxis(d[val]);
            })
            .attr("height", function(d) {

              if(d[val]) {
                if(obj.chart.get('axesConfigsObj') 
                  && obj.chart.get('axesConfigsObj').yDomainMinValue
                  && obj.chart.get('axesConfigsObj').yDomainMaxValue
                  && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue
                  && obj.chart.get('axesConfigsObj').yDomainMinValue > min
                  && !(obj.chart.get('axesConfigsObj').yDomainMinValue<0 && obj.chart.get('axesConfigsObj').yDomainMaxValue>0)){
                    if(obj.chart.get('axesConfigsObj').yDomainMinValue<0 && obj.chart.get('axesConfigsObj').yDomainMaxValue<0){
                      if(d[val]>0){
                        return 0;
                      }
                      else{
                        return Math.abs(yAxis(0)-yAxis(d[val]));
                      }
                    }
                    else{
                      return Math.abs(yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue))-yAxis(d[val]);
                    }
                  }
                else{
                  return Math.abs(yAxis(0) - yAxis(d[val]));
                }
              }


              // if(d[val] && d[val] > 0) {
              //   return height - yAxis(d[val]);
              // }
            })
            .attr("clip-path", obj.chart.getClipPathUrl())
            .on("mouseover", function(d) {
              if(!obj.chart.get('notToHideTip')){
                var n = i % measures_length;
                if(isValidLegendFilter){
                  n = legendFilter;
                } 
                var measure = obj.chart.get('measures').objectAt(n);
                var fact =  measure.get('displayName') || measure.get('fieldName');
                var factType = measure.get('formatAs');
                var factUnit = measure.get('factUnit');
                var otherData={};
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
              // obj.chart.chartElementOnMouseEnter(d, otherData);
            })
            .on("mouseout",function(){
              if(!obj.chart.get('notToHideTip')){
                tip.hide();
              }
            })
            .on("click", function(d) {
              var n = i % measures_length;
              var cds = obj.cds.objectAt(0);
              //var rawData = cds.rawData();
              var filter = {};
              filter.dimension = cds.get('dimensionName');
              filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
              filter.value = d.key;

              if(isValidLegendFilter){
                n = legendFilter;
              } 
              var measure = obj.chart.get('measures').objectAt(n);
              var fact =  measure.get('displayName') || measure.get('fieldName');
              var factType = measure.get('formatAs');
              var factUnit = measure.get('factUnit');
              var otherData={};
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
    });
    


    obj.chart.drawChartLegend(arr, colorScale, true, legend_arr);
    obj.chart.set('dataLoading', false);
    obj.chart.get('dashboard').highlightFilters();
  },


});