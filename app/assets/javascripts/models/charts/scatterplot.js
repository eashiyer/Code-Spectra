/**
@module charts
@class Cibi.ScatterPlot
*/

/**
  `Cibi.ScatterPlot` is an Ember Object class representing a Scatterplot.

  It contains methods specific to Scatterplot.

  @class Cibi.ScatterPlot
  @module charts
*/



Cibi.ScatterPlot = Ember.Object.extend({
    draw: function() {
        var obj = this;
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var filters = obj.chart.getFilters();
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
              obj._drawChart(data, obj);
          }
        }else {
          if(chartDataPresent) {
              var data = this.get('chartData')
              obj._drawChart(data, obj);
          }
        }
    },    

  /**
    This method draws a area chart within the html element specified in configObj.

    @method draw
  */
    _drawChart: function(data, obj) {   
         
      var chartData = data;
      var chart = obj.get('chart');
      chart.clearChart();
      var cds = obj.cds.objectAt(0);
      
      var legendFilter = obj.chart.get('legendFilter');
      legendFilter = legendFilter ? legendFilter.index : legendFilter;
      var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;
    
      var margin =  {
                top: chart.get('marginTop'), 
                right: chart.get('marginRight'), 
                bottom: chart.get('marginBottom'),  
                left: chart.get('marginLeft'), 
              }  
      var height = obj.chart.get('height') - margin.top - margin.bottom;
      var val=cds.get('factDisplay');
      var xValues = chartData.map(function(d) {
        return d.key;
      });
      var yValues = chartData.map(function(d) {
        return d[val];
         // return d[cds.get('factFormat')+"(`"+cds.get('fact')+"`)"];
      });

      var max = d3.max(data, function(d) { 
          var vals = d.values.map(function(v) {
              return toFloat(v[val]);
          })
          return d3.max(vals); 
      });

      var min = d3.min(data, function(d) { 
          var vals = d.values.map(function(v) {
              return toFloat(v[val]);
          })
          return d3.min(vals); 
      });
      if( min > 0) { min=0; }
      var svg   = obj.chart.getSvgElement();

      var tip = obj.chart.getChartTip();
          tip.offset([-10,0]);


      var color = obj.chart.colorScale();
      
      var depth = obj.get('chart').get('chartsDataSources').objectAt(0).get('depth');

      if(cds.get('factFormat') != '' || depth){
        var yAxis = obj.chart.drawYAxis(svg, [min, max], obj.y_axis_label);
        var scale_type;
        var ymin=yAxis(min);
        if(obj.chart.get('axesConfigsObj') 
          && obj.chart.get('axesConfigsObj').yDomainMinValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue > min
          && obj.chart.get('axesConfigsObj').yDomainMaxValue
          && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue)
        {
          ymin=yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue);
        }
        var xAxis = obj.chart.drawXAxis(svg, xValues, ymin, scale_type, chartData);
      }

      if (depth) {
        var chart = obj.chart;
        var orgzKeys;
        var  zKeys, zKeyCount;
        var same_value_skew = 0.25;
        if(obj.cds.get('length') === 1) { 
            cds = obj.cds.objectAt(0);
            //chartData = cds.chartData();
           //  max = d3.max(data, function(d) { 
           //      var vals = d.values.map(function(v) {
           //          return v[val];
           //      })
           //      return d3.max(vals); 
           //  });
           // min = d3.min(data, function(d) { 
           //      var vals = d.values.map(function(v) {
           //          return v[val];
           //      })
           //      return d3.min(vals); 
           //  });
           //   if(min>0){min=0;}
            zKeys = obj.get('uniqueKeys');
            orgzKeys=obj.chart.get('original_zkeys');
            zKeyCount = zKeys.length;
             if(orgzKeys){
                color.domain(orgzKeys);
              }else{
            color.domain(zKeys);
        }
        }
         
        if(cds.get('factFormat') == ''){
          var fact = cds.get('factDisplay') || cds.get('fact');         
          new_data = [];
          data.forEach(function(dat){
            _.each(dat.values, function(d) {
                  _.each(d.values, function(v) {
                    noformatData = {}
                    noformatData.key = dat.key
                    noformatData[val] = toFloat(v[fact]);
                    noformatData.zkey = d.key
                    new_data.push(noformatData);
                  })                
            });            
          });
          if(isValidLegendFilter) {
            var key = zKeys[legendFilter];
              new_data = new_data.filter(function(v) {
                return v.zkey == key;
              });
          }
          data = new_data;
        }else{
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
       
          } else {

            var stacked_data = zKeys.map(function(key) {
              return chartData.map(function(d) {
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
            
          var data = d3.layout.stack() (stacked_data);
        }

        obj.chart.addClipPathElement(svg);
        
        var fact = svg.selectAll(".fact")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "fact");


        data = _.flatten(data);
        data = _.filter(data, function(d) {
          return d.value || d[val];
        })

        svg.selectAll("dot")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("id", function(d) {
            return "chart-" + obj.chart.id + "-" + pruneStr(d.key) + "-" + pruneStr(d.zkey);
          })
          .attr("cx", function(d) { 
            if(obj.chart.get('scale_type')=="time")
            {
              return xAxis(obj.chart.get('parseDate')(d.key)); 
            }
            else if(obj.chart.get('scale_type')=="linear")
            {
              return xAxis(d.key); 
            }
            else
            {
              return xAxis(d.key)+xAxis.rangeBand()/2;
            }  
          })
         .attr("cy", function(d) { 
            if(d.value || d[val]) {
              return yAxis(d.value || d[val]); 
              //return yAxis(d.value);   
            }
         })

        .attr("r", 5.0)
        .attr("clip-path", obj.chart.getClipPathUrl())

         .style("fill", function(d) {
            //var n = zKeys.indexOf(d.zkey);
            return color(d.zkey);             
         })
         .style("fill-opacity", 0.8)
         .style("stroke-width", 0.4)
         .on("mouseover", function(d) {
            if(!obj.chart.get('notToHideTip')){      
              var otherData={};
              obj.chart.getChartElementData(d,otherData,tip,svg);
              tip.show();
              d3.select(this).attr("r", 8.0);
            }
        })                  
        .on("mouseout", function(d) {
          if(!obj.chart.get('notToHideTip')){
            tip.hide();       
            d3.select(this).attr("r", 5.0);
          }
        })
        .on("click", function(d) {
              //var rawData = cds.rawData();
          var otherData={};
          if(cds.get('depth')){
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

            obj.chart.chartElementOnClick(this.id, filterObj, d, otherData, tip, svg);
          }
          else{
            var filter = {};
            filter.dimension = cds.get('dimensionName');
            filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
            filter.value = d.key;

            obj.chart.chartElementOnClick(this.id, filter, d, otherData, tip, svg);
          }
          d3.select(this).attr("r", 8.0);
        });

        obj.chart.drawChartLegend(zKeys, color, true);
      } 





      else {
        // var  yAxis = obj.chart.drawYAxis(svg, [min,max], obj.y_axis_label_right);
        // var xAxis = obj.chart.drawXAxis(svg, xValues, yAxis(min));
        // var color = obj.chart.colorScale();
        if(cds.get('factFormat') == ''){
          var fact = cds.get('factDisplay') || cds.get('fact');
          new_data = [];
          data.forEach(function(dat){
            _.each(dat.values, function(d) {
                noformatData = {}
                noformatData.key = dat.key
                noformatData[val] = toFloat(d[fact]);
                new_data.push(noformatData);
            });            
          });
          data = new_data;
          var max = d3.max(data, function(d) { return d[val]; });
          var min = d3.min(data, function(d) { return d[val]; });
          
          var yAxis = obj.chart.drawYAxis(svg, [min, max], obj.y_axis_label);
          var scale_type;
          var ymin=yAxis(min);
          if(obj.chart.get('axesConfigsObj') 
            && obj.chart.get('axesConfigsObj').yDomainMinValue
            && obj.chart.get('axesConfigsObj').yDomainMinValue > min
            && obj.chart.get('axesConfigsObj').yDomainMaxValue
            && obj.chart.get('axesConfigsObj').yDomainMinValue < obj.chart.get('axesConfigsObj').yDomainMaxValue)
          {
            ymin=yAxis(obj.chart.get('axesConfigsObj').yDomainMinValue);
          }
          var xAxis = obj.chart.drawXAxis(svg, xValues, ymin, scale_type, chartData);

        }
                    
          svg.selectAll("dot")
           .data(data)
           .enter()
           .append("circle")
            .attr("class", "dot")
           .attr("id", function(d) {
            return "chart-" + obj.chart.id + "-" + pruneStr(d.key)
           })
           .attr("cx", function(d) { 
              if(obj.chart.get('scale_type')=="time")
              {
                return xAxis(obj.chart.get('parseDate')(d.key)); 
              }
              else if(obj.chart.get('scale_type')=="linear")
              {
                return xAxis(d.key); 
              }
              else
              {
                return xAxis(d.key)+xAxis.rangeBand()/2;
              }  
           })
           .attr("cy", function(d) { 
              if(d[val] || d[val] !== undefined) {
                if(d[val] instanceof Array){
                  return yAxis(d[val]); 
                }else{
                    return yAxis(d[val]);                
                }
              }
           })

          .attr("r", 5.0)
          .attr("clip-path", obj.chart.getClipPathUrl())

          .style("fill", function(d) {
              return color(d);             
           })
          .style("fill-opacity", 0.8)
          .style("stroke-width", 0.4)
          .on("click", function(d) {
            //var rawData = cds.rawData();
            var filter = {};
            filter.dimension = cds.get('dimensionName');
            filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
            filter.value = d.key;

            var otherData={};

            obj.chart.chartElementOnClick(this.id, filter, d, otherData, tip, svg);
            d3.select(this).attr("r", 8.0);          
          })        
          .on("mouseover", function(d) {
            if(!obj.chart.get('notToHideTip')){     
              var otherData={};   
              obj.chart.getChartElementData(d,otherData,tip,svg);
              tip.show();
              d3.select(this).attr("r", 8.0);
            }
          })                  
          .on("mouseout", function(d) {
            if(!obj.chart.get('notToHideTip')){
              tip.hide();     
              d3.select(this).attr("r", 5.0);
            }
          });

      }
      obj.chart.set('dataLoading', false);
      obj.chart.get('dashboard').highlightFilters();
  },

});