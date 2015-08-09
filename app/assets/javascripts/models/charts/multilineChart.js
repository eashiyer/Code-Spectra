/**
@module charts
@class Cibi.MultilineChart
*/

/**
  `Cibi.MultilineChart` is an Ember Object class representing multiline chart.

  It contains methods specific to multiline chart.

  @class Cibi.MultilineChart
  @module charts
*/
Cibi.MultilineChart = Ember.Object.extend({
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

        // if((cds.get('measures').get('length')<1)
        //   || (cds.get('dimensions').get('length')<1)
        //   || (cds.get('dimensions').get('length')>2)
        //   || (cds.get('dimensions').get('length')==2 && cds.get('measures').get('length')>1)
        //   ){
        //   $("#" + obj.element).html("<div class='alert alert-error'>Improper Configuration</div>");
        // }
        // else{
        
          cds.chartData(obj._chartDataCallback, obj, filters);
          var depth = cds.get('depth');
          var depthFormat = cds.get('depthFormat');
          obj.chart.set("isSetup", false);  
        // }        
    },

    _chartDataCallback: function(data, obj) {
        obj.set('chartData', data);
        obj.set('uniqueKeys', obj.chart.get('depth_unique_values'));
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
              obj._drawMultilineChart(data, obj);
          }
        }else {
          if(chartDataPresent) {
              var data = this.get('chartData')
              obj._drawMultilineChart(data, obj);
          }
        }
    },
    /**
      This method draws a multiline chart within the html element specified in configObj.

      @method draw
    */
    _drawMultilineChart: function(data, self) {
        var obj = self ;
        
        var cds = null, max = 0, zKeys, zKeyCount,orgzKeys;
        var chartData = data;
        obj.chart.clearChart();
        var legendFilter = obj.chart.get('legendFilter');
        legendFilter = legendFilter ? legendFilter.index : legendFilter;
        var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;
        
        var arr=[]; var legend_arr=[];

        var measures = obj.chart.get('measures');

      for(i = 0; i < measures.get('length'); i++) {
        arr.push(measures.objectAt(i).get('fieldName'));
        legend_arr.push(measures.objectAt(i).get('displayName') || measures.objectAt(i).get('fieldName'));
      }

            
        var chart = obj.chart;
        var cds = null, max = 0, zKeys, zKeyCount;
        var same_value_skew = 0.25;
        var formatDate;
        var parseDate;
        var bisectDate = d3.bisector(function(d) { 
          if(d.key)
          {
            return parseDate(d.key);  
          }               
        }).left;

        var val = obj.chart.get('measures').objectAt(0).get('displayName');

        if(measures.get('length') === 1) { 

            cds = obj.cds.objectAt(0);

            max = d3.max(data, function(d) { 
                var vals = d.values.map(function(v) {
                    return v[val];
                })
                return d3.max(vals); 
            });
             min = d3.min(data, function(d) { 
                var vals = d.values.map(function(v) {
                    return v[val];
                })
                return d3.min(vals); 
            });
             if(min>0){min=0;}
            zKeys = obj.get('uniqueKeys');
            zKeys = _.sortBy(zKeys, function(k) { return k; });
            zKeyCount = zKeys.length;
            var xValues = _.map(data, function(d) {
            return d.key;
        });

        var svg   = obj.chart.getSvgElement();
        orgzKeys=obj.chart.get('original_zkeys');
       

        var tip = obj.chart.getChartTip();
            tip.offset([-10,0]);
        
        if(isValidLegendFilter) {
          var key = zKeys[legendFilter];
          var stacked_data = [];
          var cd = chartData.map(function(d) {
            if(!d.key || d[val] === undefined || d[val] === null) {
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
          return data.map(function(d) {
            if(!d.key || d[val] === undefined || d[val] === null) {
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
          && obj.chart.get('axesConfigsObj').yDomainMinValue > min
          && obj.chart.get('axesConfigsObj').yDomainMaxValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue)
        {
          ymin=yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue);
        }
        var xAxis = obj.chart.drawXAxis(svg, xValues, ymin);
        formatDate=chart.get('formatDate');
        parseDate=chart.get('parseDate');
        var data = d3.layout.stack() (stacked_data);

        var color = obj.chart.colorScale();
         if(orgzKeys){
            color.domain(orgzKeys);
        }else{
            color.domain(zKeys);
        }
        
         var line = d3.svg.line()            
            .x(function(d) { 
                if(formatDate)
                {
               
                  return xAxis(parseDate(d.key)); 
                  
                }
                else
                {
                  return xAxis(d.key)+((obj.chart.get('scale_type')=="ordinal")? xAxis.rangeBand()/2 : 0);
                }    
            })
            .y(function(d) { 
              if(d.value) {
                var n = zKeys.indexOf(d.zkey);
                return yAxis(d.value + n * same_value_skew); 
              }
            });
                
    if(obj.step_function) {
      line.interpolate("step-after");
    }  
    else {
      if(obj.chart.get('scale_type')=="time")
      {
        line.interpolate("cardinal");  
      }
      else
      {
        line.interpolate("linear");
      }      
    }
        var formatDateText = function(d) { 
           if(d.key )
           {
          return formatDate(parseDate(d.key));
           }
        },
            formatMoneyText = function(d) {
              var displayFormat=obj.chart.get('axesConfigsObj').yAxisDisplayUnit;
              var value = CommaFormatted(d.value, displayFormat);
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

        obj.chart.addClipPathElement(svg);

        var fact = svg.selectAll(".fact")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "fact");

        fact.append("path")
          .attr("class", "line")
          .attr("d", function(d, i) { 
              d = _.filter(d, function(x) {
                return x.value;
              });                
              return line(d); 
          })
          .attr("clip-path", obj.chart.getClipPathUrl())
          .style("stroke", function(d) { 
            var zkey = _.filter(d.map(function(x) { return x.zkey }).uniq(), function(d) { return d })[0];            
            if(zkey) {
              return color(zkey);               
            }
            
          })
          .style('shape-rendering', 'auto')
          .style('fill', 'none')
          .style("font-weight", "200")
          .style("stroke-width", "2");

        if(chart.get('scale_type')=="time"){  
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
                var count=0;
                _.each(data,function(dat){
                  count++;

                  d0 = dat.filter(function(d) { 
                    if(d.key )
                    {
                    return d.key && formatDate(parseDate(d.key)) == formatDate(x0) ;
                    }
                  });
                  if(d0.length > 0){
                    d = d0[0];
                   
                    focus.select((".y"+count)).style("opacity", 1);
                    focus.select(("circle.y"+count)).style("opacity", 1);
                    focus.select(("text.y"+count)).style("opacity", 1);
                    focus.select((".y"+count)).attr("transform", "translate(" + (chart.get('width') * -1) + ", " + yAxis(d.value) + ")").attr("x2", (obj.chart.get('width') + xAxis(parseDate(d.key))));
                    focus.select(("circle.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")");
                    focus.select(("text.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")")
                    .text(formatDateText(d)+" - "+formatMoneyText(d));
                    
                  } 
                  else
                  {
                    focus.select((".y"+count)).style("opacity", 0);
                    focus.select(("circle.y"+count)).style("opacity", 0);
                    focus.select(("text.y"+count)).style("opacity", 0);
                  }               
                })
                ;
                         
                focus.select(".x").attr("transform", "translate(" + (xAxis(parseDate(d.key))) + ",0)");
                      
                // var prev;
                // focus.selectAll("text").each(function(d, i) {
                //   if(i > 0) {
                //     var thisbb = this.getBoundingClientRect(),
                //         prevbb = prev.getBoundingClientRect();
                //     // move if they overlap
                //     if(!(thisbb.right < prevbb.left || 
                //             thisbb.left > prevbb.right || 
                //             thisbb.bottom < prevbb.top || 
                //             thisbb.top > prevbb.bottom)) {
                //         var ctx = thisbb.left + (thisbb.right - thisbb.left)/2,
                //             cty = thisbb.top + (thisbb.bottom - thisbb.top)/2,
                //             cpx = prevbb.left + (prevbb.right - prevbb.left)/2,
                //             cpy = prevbb.top + (prevbb.bottom - prevbb.top)/2,
                //             off = Math.sqrt(Math.pow(ctx - cpx, 2) + Math.pow(cty - cpy, 2))/2;
                //         d3.select(this).attr("transform",
                //             "translate(" + d3.transform(d3.select(this).attr("transform")).translate[0] + "," +
                //                            (d3.transform(d3.select(this).attr("transform")).translate[1]-3) + ")");
                //     }
                //   }
                //   prev = this;
                // });
            })
            .style("fill","none")
            .style("pointer-events","all");

          var focus = svg.append("g")
                .attr("class", "focus")
                .attr("clip-path", obj.chart.getClipPathUrl())
                .style("display", "none");

            focus.append("line")
                .attr("class", "x")
                .attr("y1", yAxis(min) - 6)
                .attr("y2", yAxis(min) + 6);
            
            var count=0;
          
            _.each(data,function(d){
              count++;
              focus.append("line")
                .attr("class", ("y"+count))
                .attr("x1", obj.chart.get('width')) 
                .attr("x2", obj.chart.get('width') + 6)                
                .style("stroke", function() {
                  for (var i = 0; i < d.length; i++) {
                    if(d[i].zkey)
                    {
                     return d3.rgb(color(d[i].zkey)).darker();
                    }
                  }                           
               }); 

              focus.append("circle")
                .attr("class", ("y"+count))
                .attr("r", 6)
                .style("stroke", function() {
                  for (var i = 0; i < d.length; i++) {
                    if(d[i].zkey)
                    {
                     return d3.rgb(color(d[i].zkey)).darker();
                    }
                  }                           
               });

              focus.append("text")
                .attr("class", ("y"+count))
                .attr("dy", "-1em")
                .style("fill", function() {
                  for (var i = 0; i < d.length; i++) {
                    if(d[i].zkey)
                    {
                     return d3.rgb(color(d[i].zkey)).darker();
                    }
                  }                           
               })
                .style("font-size","12px")
                .on("mouseover",function(){
                      var text=d3.select(this);
                      text.style("font-size", "20px");
                      text.style("opacity",1);                      

                    })
                    .on("mouseout",function(){
                      var text=d3.select(this);
                      setTimeout(function(){
                        text.style("font-size", "10px");
                      },1500);
                    }); 
            });

             svg.append("rect")
            .attr("width", (obj.chart.get('width')-40))
            .attr("height", (obj.chart.get('height')-60))
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", function() {
              focus.selectAll("line").style("opacity",0);
              focus.selectAll("circle").style("opacity",0);
              focus.selectAll("text").style("opacity",0); 
                var x_pos = d3.mouse(this)[0],
                y_pos = d3.mouse(this)[1],
                x0 = xAxis.invert(x_pos);
                var count=0;
                _.each(data,function(dat){
                  count++;

                  d0 = dat.filter(function(d) { 
                    if(d.key !=null || d.key !="null")
                    {
                    return d.key && formatDate(parseDate(d.key)) == formatDate(x0) ;
                    }
                  });
                  if(d0.length > 0){
                    d = d0[0];
                
                    
                    focus.select((".y"+count)).style("opacity", 1);
                    focus.select(("circle.y"+count)).style("opacity", 1);
                    focus.select(("text.y"+count)).style("opacity", 1);
                    focus.select((".y"+count)).attr("transform", "translate(" + (chart.get('width') * -1) + ", " + yAxis(d.value) + ")").attr("x2", (obj.chart.get('width') + xAxis(parseDate(d.key))));
                    focus.select(("circle.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")");
                    focus.select(("text.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")")
                    .text(formatDateText(d)+" - "+formatMoneyText(d));
                    
                  } 
                  else
                  {
                    // focus.select((".y"+count)).style("opacity", 0);
                    // focus.select(("circle.y"+count)).style("opacity", 0);
                    // focus.select(("text.y"+count)).style("opacity", 0);
                  }               
                });
                   
                     
                focus.select(".x").attr("transform", "translate(" + (xAxis(parseDate(d.key))) + ",0)");
                   
                focus.select(".x").style("opacity",1);
                // var prev;
                // focus.selectAll("text").each(function(d, i) {
                //   if(i > 0) {
                //     var thisbb = this.getBoundingClientRect(),
                //         prevbb = prev.getBoundingClientRect();
                //     // move if they overlap
                //     if(!(thisbb.right < prevbb.left || 
                //             thisbb.left > prevbb.right || 
                //             thisbb.bottom < prevbb.top || 
                //             thisbb.top > prevbb.bottom)) {
                //         var ctx = thisbb.left + (thisbb.right - thisbb.left)/2,
                //             cty = thisbb.top + (thisbb.bottom - thisbb.top)/2,
                //             cpx = prevbb.left + (prevbb.right - prevbb.left)/2,
                //             cpy = prevbb.top + (prevbb.bottom - prevbb.top)/2,
                //             off = Math.sqrt(Math.pow(ctx - cpx, 2) + Math.pow(cty - cpy, 2))/2;
                //         d3.select(this).attr("transform",
                //             "translate(" + d3.transform(d3.select(this).attr("transform")).translate[0] + "," +
                //                            (d3.transform(d3.select(this).attr("transform")).translate[1]-3) + ")");
                //     }
                //   }
                //   prev = this;
                // });
            })
            .style("fill","none")
            .style("pointer-events","all");
        }//time

        if(chart.get('scale_type')=="ordinal")
        {
            data = _.flatten(data);
            data = _.filter(data, function(d) {
              return d.value;
            });
          
            svg.selectAll("circle")
             .data(data)
             .enter()
             .append("circle")
             .attr("id", function(d) {
              return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
             })
             .attr("cx", function(d) { 
                return xAxis(d.key) + xAxis.rangeBand() / 2; 
             })
             .attr("cy", function(d) { 
                if(d.value) {
                  var n = zKeys.indexOf(d.zkey);
                  return yAxis(d.value + n * same_value_skew); 
                  //return yAxis(d.value);   
                }
             })
             .attr("r", function(d) {
                var max_width = 20;
                var w = xAxis.rangeBand();
                var r = w > max_width ? max_width : w;
                return r / 5;
             })
             .attr("clip-path", obj.chart.getClipPathUrl())
             .style("fill", function(d) {
                //var n = zKeys.indexOf(d.zkey);
                return color(d.zkey);             
             })
             .style("stroke", function(d) {
                //var n = zKeys.indexOf(d.zkey);
                return d3.rgb(color(d.zkey)).darker();             
             })
             .on("mouseover", function(d) {
                if(!obj.chart.get('notToHideTip')){
                  var otherData={};
                  obj.chart.getChartElementData(d,otherData,tip,svg);
                  tip.show();
                }
            })                  
            .on("mouseout", function(){
              if(!obj.chart.get('notToHideTip')){
                tip.hide();
              }
            })
            .on("click", function(d) {
                  //var rawData = cds.rawData();
                var filterObj = [], dim_filter = {}, dep_filter = {};
                dim_filter.dimension = cds.get('dimensionName');
                dim_filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
                dim_filter.value = d.key;
                filterObj.push(dim_filter);

                dep_filter.dimension = cds.get('depth');
                dep_filter.formatAs = "";
                dep_filter.value = d.zkey;
                filterObj.push(dep_filter);

                var otherData={};

                obj.chart.chartElementOnClick(this.id, filterObj, d, otherData, tip, svg);
            });

        }        
        obj.chart.drawChartLegend(zKeys, color, true);
        obj.chart.set('dataLoading', false);
        obj.chart.get('dashboard').highlightFilters();
    }
    else              // if(measures>2)
    {
        var chart=obj.get('chart');
                
        var chartFilters=chart.get('chartFiltersObj');
        var measures=obj.chart.get('measures')
        chart.clearChart();
        var fact_keys = [];
        var legend_arr=[];
          measures.forEach(function(m){
              fact_keys.push(m.get('displayName'));
          });
          legend_arr=fact_keys;
        var legendFilter =obj.chart.get('legendFilter');
        legendFilter = legendFilter ? legendFilter.index : legendFilter;
        var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;
        var cds=obj.cds.objectAt(0);
        var xValues = chartData.map(function(d) {
            return d.key;
        });
        var max = d3.max(chartData,function(dat){
            var facts = [];
            measures.forEach(function(m){
              facts.push(dat[m.get('displayName')]);
            });
          return d3.max(facts);
        });
        var min = d3.min(chartData, function(dat){ 
            var facts = [];
            measures.forEach(function(m){
                facts.push(dat[m.get('displayName')]);
            });
            return d3.min(facts);
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
        var formatDate=chart.get('formatDate');
        var parseDate=chart.get('parseDate');
        var colorScale= obj.chart.colorScale().domain(fact_keys); 
        obj.chart.addClipPathElement(svg);

        if(isValidLegendFilter) {
            var key = fact_keys[legendFilter];
            var stacked_data = [];
            var cd =  chartData.map(function(d) {
                if(d.values.length > 0){
                    return { x:d.key,key:d.key,value:+d.values[0][key],y:+d.values[0][key],factkey:key}
                } else {
                    return { x:"",y:0 }
                }
            });
            stacked_data.push(cd);

            var max = d3.max(cd, function(d) { return d.value; });
            var min = d3.min(cd, function(d) { 
                return d.value; 
            });
            if(min>0){min=0;}
        } else {
            var stacked_data=fact_keys.map(function(key,i){
                return chartData.map(function(d){

                    if(d.values.length > 0){
                      return { x:d.key,key:d.key,value:+d.values[0][key],y:+d.values[0][key],factkey:key}
                    }else{
                      return { x:"",y:0 }
                    }
                });
              });
            }
            var data = d3.layout.stack() (stacked_data);
                
            var line = d3.svg.line()            
                .x(function(d) { 
                    if(formatDate && obj.chart.get('scale_type')=="time")
                    {
                     
                      return xAxis(parseDate(d.key));
                      
                    }
                    else
                    {
                      return xAxis(d.key)+((obj.chart.get('scale_type')=="ordinal")? xAxis.rangeBand()/2 : 0);
                    }    
                })
                .y(function(d) { 
                  if(d.value) {
                    var n = fact_keys.indexOf(d.factkey);
                    return yAxis(d.value + n * same_value_skew); 
                  }
                });
                          
            if(obj.step_function) {
              line.interpolate("step-after");
            } else {
                if(obj.chart.get('scale_type')=="time")
                {
                  line.interpolate("cardinal");  
                }
                else
                {
                  line.interpolate("linear");
                }      
            }
            var formatDateText = function(d) { 
                if(d.key)
                {
                    return formatDate(parseDate(d.key));
                }

            },
            formatMoneyText = function(d) {
                if(cds.get('factType'))
                {
                    if(cds.get('factType')=="money")
                    {
                      var val = d3.format(',.2f')(d.value);    
                      if (cds.get('factUnit')) {
                        if(cds.get('factUnit') == "USD") {
                          val = " $ " + val;
                        } else if(cds.get('factUnit') == "Rs") {
                          val = " ₹ " + val;
                        } else if(cds.get('factUnit') == "Euro"){
                          val = " € " + val;
                        }
                      }
                      return val;
                    }
                    else if (cds.get('factType')=="percentage"){
                      var val=d3.format(',.2f')(d.value);
                      val=val+"%";
                      return val;
                    }
                    else{
                      return d.value;
                    }
                } else {
                    return d.value;
                }             
            };

            obj.chart.addClipPathElement(svg);

            var tip = obj.chart.getChartTip();
                tip.offset([-10,0]);

            var fact = svg.selectAll(".fact")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "fact");

            fact.append("path")
                .attr("class", "line")
                .attr("d", function(d, i) { 
                    d = _.filter(d, function(x) {
                        return x.value;
                    });                
                    return line(d); 
                })
                .attr("clip-path", obj.chart.getClipPathUrl())
                .style("stroke", function(d) { 
                    var factkey = _.filter(d.map(function(x) { return x.factkey }).uniq(), function(d) { return d })[0];            
                    if(factkey) {
                      return colorScale(factkey);               
                    }
                })
                .style('shape-rendering', 'auto')
                .style('fill', 'none')
                .style("font-weight", "200")
                .style("stroke-width", "2");

            if(chart.get('scale_type')=="time") {  
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
                        var count=0;
                        _.each(data,function(dat){
                            count++;

                            d0 = dat.filter(function(d) { 
                                if(d.key)
                                {
                                return d.key && formatDate(parseDate(d.key)) == formatDate(x0) ;
                                }
                            });
                            if(d0.length >0){
                                d = d0[0];                               
                                focus.select((".y"+count)).style("opacity", 1);
                                focus.select(("circle.y"+count)).style("opacity", 1);
                                focus.select(("text.y"+count)).style("opacity", 1);
                                focus.select((".y"+count)).attr("transform", "translate(" + (chart.get('width') * -1) + ", " + yAxis(d.value) + ")").attr("x2", (obj.chart.get('width') + xAxis(parseDate(d.key))));
                                focus.select(("circle.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")");
                                focus.select(("text.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")")
                                  .text(formatDateText(d)+" - "+formatMoneyText(d));                              
                            } else {
                                focus.select((".y"+count)).style("opacity", 0);
                                focus.select(("circle.y"+count)).style("opacity", 0);
                                focus.select(("text.y"+count)).style("opacity", 0);
                            }               
                        });
                                   
                        focus.select(".x").attr("transform", "translate(" + (xAxis(parseDate(d.key))) + ",0)");
                    })
                    .style("fill","none")
                    .style("pointer-events","all");

                var focus = svg.append("g")
                    .attr("class", "focus")
                    .attr("clip-path", obj.chart.getClipPathUrl())
                    .style("display", "none");

                focus.append("line")
                    .attr("class", "x")
                    .attr("y1", yAxis(min) - 6)
                    .attr("y2", yAxis(min) + 6);
                  
                var count=0;
                    
                _.each(data,function(d){
                    count++;
                    focus.append("line")
                        .attr("class", ("y"+count))
                        .attr("x1", obj.chart.get('width')) 
                        .attr("x2", obj.chart.get('width') + 6)                
                        .style("stroke", function() {
                            for (var i = 0; i < d.length; i++) {
                                if(d[i].factkey)
                                {
                                    return d3.rgb(colorScale(d[i].factkey)).darker();
                                }
                            }                           
                        }); 

                    focus.append("circle")
                        .attr("class", ("y"+count))
                        .attr("r", 6)
                        .style("stroke", function() {
                            for (var i = 0; i < d.length; i++) {
                              if(d[i].factkey)
                              {
                               return d3.rgb(colorScale(d[i].factkey)).darker();
                              }
                            }                           
                        });

                    focus.append("text")
                        .attr("class", ("y"+count))
                        .attr("dy", "-1em")
                        .style("fill", function() {
                            for (var i = 0; i < d.length; i++) {
                              if(d[i].factkey)
                              {
                               return d3.rgb(colorScale(d[i].factkey)).darker();
                              }
                            }                           
                        })
                        .on("mouseover",function(){
                            var text=d3.select(this);
                            text.style("font-size", "20px");
                            text.style("opacity",1);                      

                        })
                        .on("mouseout",function(){
                            var text=d3.select(this);
                            setTimeout(function(){
                                text.style("font-size", "10px");
                            },1500);
                        }); 
                }); // end _each(data)

                svg.append("rect")
                    .attr("width", (obj.chart.get('width')-40))
                    .attr("height", (obj.chart.get('height')-60))
                    .on("mouseover", function() { focus.style("display", null); })
                    .on("mouseout", function() { focus.style("display", "none"); })
                    .on("mousemove", function() {
                        focus.selectAll("line").style("opacity",0);
                        focus.selectAll("circle").style("opacity",0);
                        focus.selectAll("text").style("opacity",0); 
                        var x_pos = d3.mouse(this)[0],
                        y_pos = d3.mouse(this)[1],
                        x0 = xAxis.invert(x_pos);
                        var count=0;
                        _.each(data,function(dat){
                            count++;

                            d0 = dat.filter(function(d) { 
                              if(d.key)
                              {
                              return d.key && formatDate(parseDate(d.key)) == formatDate(x0) ;  // here
                              }
                            });
                            if(d0.length > 0){
                              d = d0[0];
                            
                              focus.select((".y"+count)).style("opacity", 1);
                              focus.select(("circle.y"+count)).style("opacity", 1);
                              focus.select(("text.y"+count)).style("opacity", 1);
                              focus.select((".y"+count)).attr("transform", "translate(" + (chart.get('width') * -1) + ", " + yAxis(d.value) + ")").attr("x2", (obj.chart.get('width') + xAxis(parseDate(d.key))));
                              focus.select(("circle.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")");
                              focus.select(("text.y"+count)).attr("transform", "translate(" + xAxis(parseDate(d.key)) + "," + yAxis(d.value) + ")")
                              .text(formatDateText(d)+" - "+formatMoneyText(d));
                              
                            } 
                          });
                               
                                
                          focus.select(".x").attr("transform", "translate(" + (xAxis(parseDate(d.key))) + ",0)");
                               
                          focus.select(".x").style("opacity",1);
                      })
                      .style("fill","none")
                      .style("pointer-events","all");
                  }//time

                  if(chart.get('scale_type')=="ordinal")
                  {
                      data = _.flatten(data);
                      data = _.filter(data, function(d) {
                        return d.value;
                      });
                    
                      svg.selectAll("circle")
                       .data(data)
                       .enter()
                       .append("circle")
                       .attr("id", function(d) {
                        return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
                       })
                       .attr("cx", function(d) { 
                          return xAxis(d.key) + xAxis.rangeBand() / 2; 
                       })
                       .attr("cy", function(d) { 
                          if(d.value) {
                            var n = fact_keys.indexOf(d.factkey);
                            return yAxis(d.value + n * same_value_skew); 
                            //return yAxis(d.value);   
                          }
                       })
                       .attr("r", function(d) {
                          var max_width = 20;
                          var w = xAxis.rangeBand();
                          var r = w > max_width ? max_width : w;
                          return r / 5;
                       })
                       .attr("clip-path", obj.chart.getClipPathUrl())
                       .style("fill", function(d) {
                          //var n = zKeys.indexOf(d.zkey);
                          return colorScale(d.factkey);             
                       })
                       .style("stroke", function(d) {
                          //var n = zKeys.indexOf(d.zkey);
                          return d3.rgb(colorScale(d.factkey)).darker();             
                       })
                       .on("mouseover", function(d) {
                          if(!obj.chart.get('notToHideTip')){
                            var key = d.key;
                            var value = d.y;
                            var fact = d.factkey;
                            var otherData={},factType,factUnit;
                            measures.forEach(function(m,i){
                              if(m.get('displayName') == fact){
                                factType = m.get('formatAs');
                                factUnit = m.get('factUnit');
                              }
                            });
                            otherData.fact = fact;
                            otherData.factType = factType;
                            otherData.factUnit = factUnit;
                            obj.chart.getChartElementData(d,otherData,tip,svg);
                            tip.show();
                          }
                      })                  
                      .on("mouseout", function(){
                        if(!obj.chart.get('notToHideTip')){
                          tip.hide();
                        }
                      })
                      .on("click", function(d) {
                            //var rawData = cds.rawData();
                          var filterObj = [], dim_filter = {}, dep_filter = {};
                          dim_filter.dimension = cds.get('dimensionName');
                          dim_filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
                          dim_filter.value = d.key;
                          filterObj.push(dim_filter);

                          dep_filter.dimension = cds.get('depth');
                          dep_filter.formatAs = "";
                          dep_filter.value = d.factkey;
                          filterObj.push(dep_filter);

                          var key = d.key;
                          var value = d.y;
                          var fact = d.factkey;
                          var otherData={},factType,factUnit;
                          measures.forEach(function(m,i){
                            if(m.get('displayName') == fact){
                              factType = m.get('formatAs');
                              factUnit = m.get('factUnit');
                            }
                          });
                          otherData.fact = fact;
                          otherData.factType = factType;
                          otherData.factUnit = factUnit;

                          obj.chart.chartElementOnClick(this.id, filterObj, d, otherData, tip, svg);
                      });
                  }        
                  obj.chart.drawChartLegend(fact_keys, colorScale, true,legend_arr);
                  obj.chart.set('dataLoading', false);
                  obj.chart.get('dashboard').highlightFilters();
    }//else
  }// mainfun


   
});

