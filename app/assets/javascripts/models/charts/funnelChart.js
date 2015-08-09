/**
@module charts
@class Cibi.FunnelChart
*/

/**
  `Cibi.FunnelChart` is an Ember Object class representing funnel chart.

  It contains methods specific to funnel chart.

  @class Cibi.FunnelChart
  @module charts
*/

Cibi.FunnelChart = Ember.Object.extend({

    init: function() {
        if(!this.element) {
            throw new Error("Need to specify element id");
        }

        // if(!this.dimensionName) {
        //     throw new Error("Need to specify dimension");
        // }

        this.set("currentFilterKey", null);
    },

    draw: function(preview) {
        var obj = this;
        var filters = obj.chart.getFilters();
        obj.chart.set('dataLoading', true);
        var cds = obj.chart.get('chartsDataSources').objectAt(0);           

        var data = cds.chartData(obj._drawChart, obj, filters);
        obj.chart.set("isSetup", false);
       
    },

    /**
      This method draws a pie chart within the html element specified in configObj.

      @method draw
    */
    _drawChart: function(data, obj) {
        $("#" + obj.element).html("");
         var legendFilter = obj.chart.get('legendFilter');
        legendFilter = legendFilter ? legendFilter.index : legendFilter;
        var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;

        var chart = obj.get('chart');

        var dimension = chart.get('dimensions').objectAt(0).get('displayName');
        var measure = chart.get('measures').objectAt(0).get('displayName');
        
        var dsb = chart.get('dashboard');
        if(dsb.get('chartsOnClickFilters').length == 0){
            chart.set('original_keys', data.map(function(d){
                return d[dimension];   
            }));
        }

        var keys = data.map(function(d) {
                return d[dimension];
        });

        if(isValidLegendFilter){
          var key = keys[legendFilter];
          var cd = data.map(function(d) {
            var data_key=d[dimension];
            if(data_key == key) {
              return d;  
            }
          });
            data = cd.filter(function(d) {
              return !(d === "" || typeof d == "undefined" || d === null);
            }); 
        }

        var data = _.map(data, function(x){return [x[dimension], Math.round(parseFloat(x[measure])*100)/100]})

        var orgKeys= chart.get('original_keys');
        color = obj.chart.colorScale();     
        if(orgKeys){
            color.domain(orgKeys);
        }else{
            color.domain(keys);
        }

        var margin =  {
          top: 0, 
          right: 0, 
          bottom: 0,  
          left: 0, 
        };

        var width  = chart.get('width')  - margin.left - margin.right;
        var height = chart.get('height') - margin.top - margin.bottom;    

        var funnelObj = {};
          funnelObj.data = data;
          funnelObj.totalEngagement = 0;
            for(var i = 0; i < funnelObj.data.length; i++){
              funnelObj.totalEngagement += funnelObj.data[i][1];
            }
          var funnel_width = (width*65)/100; // 65% fo total width 
          funnelObj.width = funnel_width;
          funnelObj.height = height;
          var bottomPct = 1/5;
          funnelObj._slope = 2*height/(funnel_width - bottomPct*funnel_width);
          funnelObj._totalArea = (funnel_width+bottomPct*funnel_width)*height/2;


        var total_val=0;
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var val = cds.get('factDisplay');
        chart.setDateFormats();
        data.map(function(d)
        {   
            total_val+=d[1];
        });

        var tip = chart.getChartTip();

        var funnelChart = new D3Funnel("#" + obj.element);

        var options = {
            width: width,          // In pixels; defaults to container's width (if non-zero)
            height: height,         // In pixels; defaults to container's height (if non-zero)
            bottomWidth: 2/3,    // The percent of total width the bottom should be
            bottomPinch: 0,      // How many sections to pinch
            isCurved: true,     // Whether the funnel is curved
            curveHeight: 30,     // The curvature amount
            fillType: "gradient",   // Either "solid" or "gradient"
            isInverted: false,   // Whether the funnel is inverted
            hoverEffects: true,  // Whether the funnel has effects on hover
            dynamicArea: true,   // Whether the funnel should calculate the blocks by
            colorScale: color                    // the count values rather than equal heights
            
        };

        funnelChart.draw(data,options,obj,tip,total_val,cds)
        // var funnelSvg = d3.select("#" + obj.element)
        //                 .append('svg:svg')
        //                 .data([data])  
        //                 .attr('width', width)
        //                 .attr('height', height)
        //                 .append('svg:g')
        //                 .attr("transform", "translate(" + (width/2-funnel_width/2) + "," + 0 + ")");

        // // Creates the correct d3 line for the funnel
        // var funnelPath = d3.svg.line()
        //                 .x(function(d) { return d[0]; })
        //                 .y(function(d) { return d[1]; });

        // // Automatically generates colors for each trapezoid in funnel
        // //var colorScale = d3.scale.category10(); //builtin range of colors
        // var colorScale = color;

        // var paths = obj._createPaths(funnelObj,funnel_width);

        // function drawTrapezoids(funnel, i){
        //   var trapezoid = funnelSvg
        //                   .append('svg:path')
        //                   .attr('d', function(d){
        //                     return funnelPath(
        //                         [paths[i][0], paths[i][1], paths[i][2],
        //                         paths[i][2], paths[i][1], paths[i][2]]);
        //                   })
        //                   .attr("id", function(d) {
        //                     if(d[i][0]) {
        //                       return "chart-" + obj.chart.id + "-" + pruneStr(d[i][0]);  
        //                     }
        //                   })
        //                   .attr('fill', '#fff')
        //                   .on("mouseover",function(d) {
        //                     if(!obj.chart.get('notToHideTip')){
        //                       d.key = d[i][0];
        //                       d.value = d[i][1]
        //                       var otherData={};
        //                       otherData.total_val=total_val;
        //                       chart.getChartElementData(d,otherData,tip,funnelSvg);
        //                       tip.show();
        //                     }
        //                   })
        //                   .on("mouseout",function(){
        //                     if(!obj.chart.get('notToHideTip')){
        //                       tip.hide();
        //                     }
        //                   })
        //                   .on("click", function(d) {
        //                       var filter = {};
        //                       filter.dimension = cds.get('dimensionName');
        //                       filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
        //                       filter.value = d[i][0];

        //                       d.key = d[i][0];
        //                       d.value = d[i][1]
        //                       var otherData={};
        //                       otherData.total_val=total_val;

        //                       obj.chart.chartElementOnClick(this.id, filter, d, otherData, tip, funnelSvg);
        //                   });

        //   nextHeight = paths[i][[paths[i].length]-1];

        //   //var totalLength = trapezoid.node().getTotalLength();

        //   var transition = trapezoid
        //                   .transition()
        //                     //.duration(totalLength/speed)
        //                     .duration(0.5)
        //                     .ease("linear")
        //                     .attr("d", function(d){return funnelPath(paths[i]);})                            
        //                     .attr("fill", function(d){
        //                       return colorScale(d[i][0]);
        //                     })
        //                     .attr("stroke", function(d) { 
        //                       return d3.rgb(colorScale(d[i][0])).darker();
        //                     });


        //   // funnelSvg
        //   // .append('svg:text')
        //   // .text(funnel.data[i][0] + ': ' + funnel.data[i][1])
        //   // .attr("x", function(d){ return funnel.width/2; })
        //   // .attr("y", function(d){
        //   //   return (paths[i][0][1] + paths[i][1][1])/2;}) // Average height of bases
        //   // .attr("text-anchor", "middle")
        //   // .attr("dominant-baseline", "middle")
        //   // .attr("fill", "#fff");

        //     if(i < paths.length - 1){
        //       transition.each('end', function(){
        //         drawTrapezoids(funnel, i+1);
        //       });
        //     }
        //   }
        // drawTrapezoids(funnelObj, 0);

        obj.chart.drawChartLegend(keys, color, true);
        obj.chart.set('dataLoading', false);
        obj.chart.get('dashboard').highlightFilters();
    },

    // _createPaths: function(funnelObj, width){
    //   /* Returns an array of points that can be passed into d3.svg.line to create a path for the funnel */
    //   trapezoids = [];

    //   function findNextPoints(chart, prevLeftX, prevRightX, prevHeight, dataInd){
    //     // reached end of funnel
    //     if(dataInd >= chart.data.length) return;

    //     // math to calculate coordinates of the next base
    //     area = chart.data[dataInd][1]*chart._totalArea/chart.totalEngagement;
    //     prevBaseLength = prevRightX - prevLeftX;
    //     nextBaseLength = Math.sqrt((chart._slope * prevBaseLength * prevBaseLength - 4 * area)/chart._slope);
    //     nextLeftX = (prevBaseLength - nextBaseLength)/2 + prevLeftX;
    //     nextRightX = prevRightX - (prevBaseLength-nextBaseLength)/2;
    //     nextHeight = chart._slope * (prevBaseLength-nextBaseLength)/2 + prevHeight;

    //     points = [[nextRightX, nextHeight]];
    //     points.push([prevRightX, prevHeight]);
    //     points.push([prevLeftX, prevHeight]);
    //     points.push([nextLeftX, nextHeight]);
    //     points.push([nextRightX, nextHeight]);
    //     trapezoids.push(points);

    //     findNextPoints(chart, nextLeftX, nextRightX, nextHeight, dataInd+1);
    //   }

    //   findNextPoints(funnelObj, 0, width, 0, 0);
    //   return trapezoids;
    // }
});
