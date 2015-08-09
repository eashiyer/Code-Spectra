
Cibi.StackedAreaChart = Ember.Object.extend({

  init:function(){
    if(!this.element){
      throw new error("Need to Specify element id");
    }
    if(this.stacked && !this.depth){
      throw new error("Need to Specify depth for Stacked Graph");
    }
  },


  draw:function(){
    var obj=this;
    var filters=obj.chart.getFilters();
    var cds = obj.cds.objectAt(0);
    var chart=obj.get('chart');
    obj.chart.set('dataLoading', true);
    var measures = chart.get('measures');
    var dimensions=chart.get('dimensions');
    var depth=obj.chart.get('chartsDataSources').objectAt(0).get('depth');
    if(depth && measures.get('length')==1){
        var chartData = cds.chartData(obj._drawStackedAreaForDepth, obj, filters);
    }else if(measures.get('length') > 1 && dimensions.get('length') == 1){
        var chartData = cds.chartData(obj._drawStackedAreaForMultipleMeasures, obj, filters);
    }
    obj.chart.set("isSetup", false);
  },
  
  _drawStackedAreaForDepth:function(chartData,obj,filters){
    var parseDate;
    var formatDate;
    var filters = obj.chart.getFilters();
    var chart=obj.get('chart');
    var orgzKeys=obj.chart.get('original_zkeys');
    var chartFilters=chart.get('chartFiltersObj');
    var measures = chart.get('measures');
    var val=measures.objectAt(0).get('displayName');
    var data=[];
    chart.clearChart();
    var legendFilter =obj.chart.get('legendFilter');
    legendFilter = legendFilter ? legendFilter.index : legendFilter;
    var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;
    var cds=obj.cds.objectAt(0);
    var depth=obj.chart.get('chartsDataSources').objectAt(0).get('depth');
    var depthFormat=cds.get("depthFormat");
    
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
    
    var zKeys = obj.chart.get('depth_unique_values');
    var orgzKeys=obj.chart.get('original_zkeys');
    var colorScale = obj.chart.colorScale()
     if(orgzKeys){
            colorScale.domain(orgzKeys);
        }else{
            colorScale.domain(zKeys);
        }

    var ordinal_scale = chart.get('scale_type')=="ordinal";
    
    obj.chart.addClipPathElement(svg);
    if(isValidLegendFilter) {
       var key = zKeys[legendFilter];
       var stacked_data = [];
       var cd =  chartData.map(function(d) {
            if(d.values.length > 0) {
              var zkeyExists=_.find(d.values, function(dv){
                return key==dv.key;
              });
              if(zkeyExists){
                return {x: d.key, key: d.key, value: +d.values[0][val], y: +d.values[0][val], zkey: key};  
              }else{
                return {x: d.key, key: d.key, value: 0, y: 0, zkey: key};
              }
            }
       });
       stacked_data.push(cd);

       var max = d3.max(cd, function(d) { return d.value; });
       var min = d3.min(cd, function(d) { 
            return d.value; 
       });if(min>0){min=0;}
    } else {
      var stacked_data= zKeys.map(function(key){
          return chartData.map(function(d) {
              
            if(d.values.length > 0) {
                var zkeyExists=_.find(d.values, function(dv){
                    return key==dv.key;
                });

                if(zkeyExists){
                      return {x: d.key, key: d.key, value: +d.values[0][val], y: +d.values[0][val], zkey: key};  
                 } else {
                      return {x: d.key, key: d.key, value: 0, y: 0, zkey: key};
                 }
              }
          });
      });
    }

    var stack=d3.layout.stack()(stacked_data);

    var flat_stack = _.flatten(stack);
    
    var max = d3.max(flat_stack,function(s){
            return (s.y0 + s.y);
    });
    
    var min = d3.min(chartData, function(dat){ 
        var facts = [];
        measures.forEach(function(m){
            facts.push(dat[m.get('displayName')]);
    });
      return d3.min(facts);
    });
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

    var xAxis = obj.chart.drawXAxis(svg, xValues, ymin,'ordinal',chartData);
    formatDate = obj.chart.get('formatDate');
    parseDate = obj.chart.get('parseDate');

    var area=d3.svg.area()
      .x(function(d) { 
        if(obj.chart.get('scale_type')=="time"){                    
            return xAxis((parseDate) ? parseDate(d.key) : d.key);
          }
        else{
              return xAxis(d.key)+xAxis.rangeBand()/2;
          }    
        })
      .y0(function(d){
          return yAxis(d.y0);
      })
      .y1(function(d) {
            return yAxis(d.y+d.y0);
        });

      if(obj.chart.get('scale_type')=="time"){
          area.interpolate("cardinal");  
        }
      else if(obj.chart.get('scale_type')=="linear"){
          area.interpolate("linear");
        }
      else{}
      if(obj.chart.get('scale_type') == 'time'){ 

          var focus = svg.append('g')
            .attr("class", "focus")
            .style("display", "true");
          
          focus.append("text")
            .attr("class", "y0")
            .attr("dy", "-1em")
            .style("opacity",0);
          
          

          svg.selectAll('.layer')
            .data(stack)
            .enter()
            .append('path')
            .attr('class','layer')
            .attr("d",area)
            .style("fill",function(d,i){
              for(var j = 0;j < d.length ; j++){
                if(d[j].zkey){
                  return colorScale(d[j].zkey);
                }
              }
            })
            .style("fill-opacity", 0.7)
            .attr("clip-path", obj.chart.getClipPathUrl())
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); }) 
            .on("mousemove", function(d) {
              var x_pos = d3.mouse(this)[0],
              y_pos = d3.mouse(this)[1],
              x0 = xAxis.invert(x_pos),
              y0 = yAxis.invert(y_pos),
              text=x_pos+"-"+y_pos;
              display_text = x0.formatDateMonth() + " - " + y0.formatMoney();
              focus.select("text.y0").style("opacity", 1);
              focus.select("circle.y0").style("opacity", 1);
              focus.select("text.y0").attr("transform", "translate(" + x_pos + "," + y_pos + ")").text(display_text);                                                                                                                                                                                                                                            ;
              focus.select("circle.y0").attr("transform", "translate(" + x_pos + "," + y_pos + ")");
            });
            obj.plotCircles(svg, _.flatten(stacked_data), xAxis, yAxis, cds, parseDate);
          
            focus.append("circle")
              .attr("class", "y0")
              .style("fill", "#FFFFFF")
              .style("stroke", "red")
              .attr("r", 4)
              .style("opacity",0);   
        }
      if(chart.get('scale_type')=="ordinal"){
        svg.selectAll('.layer')
          .data(stack)
          .enter()
          .append('path')
          .attr('class','layer')
          .attr("d",area)
          .style("fill",function(d,i){ 
           for(var j = 0;j < d.length ; j++){
             if(d[j].zkey){
                return colorScale(d[j].zkey);
               }
              }
           })
          .style("fill-opacity", 0.7)
          .style("stroke", function(d) {
            for (var k = 0; k < d.length; k++) {
              if(d[k].zkey){
                return d3.rgb(colorScale(d[k].zkey)).darker();
              }
            }
          })

          obj.plotCircles(svg, _.flatten(stacked_data), xAxis, yAxis, cds, parseDate);
        }
      obj.chart.drawChartLegend(zKeys,colorScale, true);
      obj.chart.set('dataLoading', false);
      obj.chart.get('dashboard').highlightFilters();
   },
  _drawStackedAreaForMultipleMeasures:function(chartData,obj,filters){
      var chart=obj.get('chart');
      
      var chartFilters=chart.get('chartFiltersObj');
      var measures=obj.chart.get('measures')
      chart.clearChart();
      var fact_keys = [];
        measures.forEach(function(m){
            fact_keys.push(m.get('displayName'));
        });
      var legendFilter =obj.chart.get('legendFilter');
      legendFilter = legendFilter ? legendFilter.index : legendFilter;
      var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;
      var cds=obj.cds.objectAt(0);
      var xValues = chartData.map(function(d) {
          return d.key;
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
      
      var colorScale = obj.chart.colorScale().domain(fact_keys); 
      obj.chart.addClipPathElement(svg);

      if(isValidLegendFilter) {
       var key = fact_keys[legendFilter];
       var stacked_data = [];
       var cd =  chartData.map(function(d) {
            if(d.values.length > 0){
                return { x:d.key,key:d.key,value:+d.values[0][key],y:+d.values[0][key],factkey:key}
              }else{
                return { x:"",y:0 }
              }
       });
       stacked_data.push(cd);

       var max = d3.max(cd, function(d) { return d.value; });
       var min = d3.min(cd, function(d) { 
            return d.value; 
       });if(min>0){min=0;}
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
      var stack = d3.layout.stack() (stacked_data);

      var flat_stack = _.flatten(stack);

      var max = d3.max(flat_stack,function(s){
            return (s.y0 + s.y);
      });
      var min = d3.min(chartData, function(dat){ 
          var facts = [];
          measures.forEach(function(m){
              facts.push(dat[m.get('displayName')]);
          });
        return d3.min(facts);
      });
      if(min>0){min=0;}
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

      var xAxis = obj.chart.drawXAxis(svg, xValues, ymin,'ordinal',chartData);
      var formatDate=chart.get('formatDate');
      var parseDate=chart.get('parseDate');
      
      var area=d3.svg.area()
        .x(function(d) { 
          if(obj.chart.get('scale_type')=="time"){                    
              return xAxis((parseDate) ? parseDate(d.key) : d.key);
            }else{
                return xAxis(d.key)+xAxis.rangeBand()/2;
            }    
          })
        .y0(function(d){
            return yAxis(d.y0);
          })
        .y1(function(d) {
              return yAxis(d.y+d.y0);
          });

        if(obj.chart.get('scale_type')=="time"){
            area.interpolate("cardinal");  
        }else if(obj.chart.get('scale_type')=="linear"){
            area.interpolate("linear");
        }else{}
      
      if(obj.chart.get('scale_type') == 'time'){ 

          var focus = svg.append('g')
            .attr("class", "focus")
            .style("display", "true");
          
          focus.append("text")
            .attr("class", "y0")
            .attr("dy", "-1em")
            .style("opacity",0);

          svg.selectAll('.layer')
            .data(stack)
            .enter()
            .append('path')
            .attr('class','layer')
            .attr("d",area)
            .style("fill",function(d,i){
              for(var j = 0;j < d.length ; j++){
                if(d[j].factkey){
                  return colorScale(d[j].factkey);
                }
              }
            })
            .style("fill-opacity", 0.7)
            .attr("clip-path", obj.chart.getClipPathUrl())
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); }) 
            .on("mousemove", function(d) {
              var x_pos = d3.mouse(this)[0],
                  y_pos = d3.mouse(this)[1],
                  x0 = xAxis.invert(x_pos),
                  y0 = yAxis.invert(y_pos),
                  text=x_pos+"-"+y_pos;
              display_text = x0.formatDateMonth() + " - " + y0.formatMoney();
              focus.select("text.y0").style("opacity", 1);
              focus.select("circle.y0").style("opacity", 1);
              focus.select("text.y0").attr("transform", "translate(" + x_pos + "," + y_pos + ")").text(display_text);                                                                                                                                                                                                                                            ;
              focus.select("circle.y0").attr("transform", "translate(" + x_pos + "," + y_pos + ")");
            });
            obj.plotCircles(svg, _.flatten(stacked_data), xAxis, yAxis, cds, parseDate);
            focus.append("circle")
              .attr("class", "y0")
              .style("fill", "#FFFFFF")
              .style("stroke", "red")
              .attr("r", 4)
              .style("opacity",0);         
        }
      if(chart.get('scale_type')=="ordinal"){
        svg.selectAll('.layer')
          .data(stack)
          .enter()
          .append('path')
          .attr('class','layer')
          .attr("d",area)
          .style("fill",function(d,i){ 
           for(var j = 0;j < d.length ; j++){
             if(d[j].factkey){
                return colorScale(d[j].factkey);
               }
              }
           })
          .style("fill-opacity", 0.7)
          .style("stroke", function(d) {
            for (var k = 0; k < d.length; k++) {
              if(d[k].factkey){
                return d3.rgb(colorScale(d[k].factkey)).darker();
              }
            }
          })

          obj.plotCircles(svg, _.flatten(stacked_data), xAxis, yAxis, cds);
        }
      obj.chart.drawChartLegend(fact_keys,colorScale, true,fact_keys);
      obj.chart.set('dataLoading', false);
      obj.chart.get('dashboard').highlightFilters();

  },
  plotCircles:function(svg, chartData, xAxis, yAxis, cds, parseDate){
      var obj=this;

      var chart=obj.chart;
      var depth=obj.chart.get('chartsDataSources').objectAt(0).get('depth');
      var ordinal_scale = chart.get('scale_type')=="ordinal";
      var highlightRule=chart.get('highlightRule');
      var statsData;
      var measures = chart.get('measures');
      var measures_length = measures.get('length'); 

      if(chart.statsData){
        statsData=chart.statsData;
      }
      var max = d3.max(chartData, function(d) { return d.value; });
      var min = d3.min(chartData, function(d) { 
        return d.value; 
      });if(min>0){min=0;}
      
      var plotCircleData = _.filter(chartData,function(d){
        return d.value != 0;
      });

      var tip= obj.chart.getChartTip();
          tip.offset([-10,0]);

      if(depth){
        if(plotCircleData){        
          svg.selectAll('circle')
            .data(plotCircleData)
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
              var yHeight=d.y0+d.y;
              return yAxis(yHeight);
            })
            .attr("r", function(d) {
              var max_width = 20;
              var w = xAxis.range()[1];
              var r = w > max_width ? max_width : w;
              return r / 10;
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
            .on("mouseover",function(d,i){
              if(!obj.chart.get('notToHideTip')){
                $(this).attr("r", 4);
                var fact = cds.get('factDisplay') || cds.get('fact');
                var factType =  cds.get('factType')
                var factUnit=  cds.get('factUnit')
                var otherData={}
                otherData.fact = fact;
                otherData.factType = factType;
                otherData.factUnit = factUnit;
                obj.chart.getChartElementData(d,otherData,tip,svg);
                tip.show();
              }
            })
            .on("mouseout",function(d){
              if(!obj.chart.get('notToHideTip')){
                var max_width = 20;
                var w = xAxis.range()[1];
                var r = w > max_width ? max_width : w;
                $(this).attr("r", r / 10);
                tip.hide();
              }
            })
            .on("click",function(d){
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

              // $(this).attr("r", 4);
              var fact = cds.get('factDisplay') || cds.get('fact');
              var factType =  cds.get('factType')
              var factUnit=  cds.get('factUnit')
              var otherData={}
              otherData.fact = fact;
              otherData.factType = factType;
              otherData.factUnit = factUnit;
              
              obj.chart.chartElementOnClick(this.id, filterObj, d, otherData, tip, svg);
              
            });
          }
        }else if(measures.get('length') > 1){
        
          if(plotCircleData){        
            svg.selectAll('circle')
              .data(plotCircleData)
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
                var yHeight=d.y0+d.y;
                return yAxis(yHeight);
              })
              .attr("r", function(d) {
                var max_width = 20;
                var w = xAxis.range()[1];
                if(w == undefined){
                  return r= 2;
                }else{
                  var r = w > max_width ? max_width : w;
                  return r / 10;
                }
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
              .on("mouseover",function(d){
                if(!obj.chart.get('notToHideTip')){
                  $(this).attr("r", 4);
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
              .on("mouseout",function(d){
                if(!obj.chart.get('notToHideTip')){
                  var max_width = 20;
                  var w = xAxis.range()[1];
                  if(w == undefined){
                    $(this).attr("r", 2);
                  }else{
                    var r = w > max_width ? max_width : w;
                    $(this).attr("r", r / 10);
                  }    
                  tip.hide();
                  // obj.chart.chartElementOnMouseExit();
                }
              })
              .on("click",function(d){
                var filter1 = {};
                filter1.dimension = cds.get('dimensionName');
                filter1.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
                filter1.value = d.key;

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
                
                obj.chart.chartElementOnClick(this.id, filter1, d, otherData, tip, svg);
              });
          }
        }
      }
});