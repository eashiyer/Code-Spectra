/**
@module charts
@class Cibi.HeatMap
*/

/**
  `Cibi.HeatMap` is an Ember Object class representing heat map.

  It contains methods specific to heat map.

  @class Cibi.HeatMap
  @module charts
*/
Cibi.HeatMap = Ember.Object.extend({

    init: function() {
        if(!this.element) {
            throw new Error("Need to specify element id");
        }

        // if(!this.dimensionName) {
        //     throw new Error("Need to specify dimension");
        // }

        // TODO : Make sure all the Data Sources have depth specified
        this.set("currentFilterKey", null);
    },

    draw: function() {
        var obj = this;
        var filters = obj.chart.getFilters();
        var fcds = obj.cds.objectAt(0),
        depth = fcds.get('depth');
        obj.chart.set('dataLoading', true);
        fcds.chartData(obj._dataCallback, obj, filters);
        var depthFormat = fcds.get('depthFormat');
    },

    _dataCallback: function(data, obj) {
        var cds_data = obj.get('data') || [];
        cds_data.push(data);
        cds_data = _.sortBy(cds_data, function(d) {
            return d.cds_id;
        });
        obj.set('data', cds_data);
        obj.set('uniqueKeys', obj.chart.get('depth_unique_values'));
        obj.checkDataAndDrawChart();
    },

    checkDataAndDrawChart: function() {
        var obj = this;
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var chartData = obj.get('data');
        var uniqueKeysPresent = obj.get('uniqueKeys');
        
        if(chartData && chartData.length ==  obj.cds.get('length') && uniqueKeysPresent) {
            obj._drawHeatMap();
            obj.set('data',[]);
        }
    },


    /**
      This method draws a heat map within the html element specified in configObj.

      @method draw
    */
    _drawHeatMap: function(){
        var obj = this;
                
        $("#" + obj.element).html("");
        var data = obj.get('data');
        var col = 0; // Length of Depth Group 
        var row = 0; // Length of Dimension Group
        var xValues = [];
        var yValues = [];
        var mouseover_key = "";
        obj.chart.setDateFormats();
        var formatDate=obj.chart.get('formatDate');
        var parseDate=obj.chart.get('parseDate');
        // Get the Y Axis Values First
        var fCds = this.cds.objectAt(0);
        // yValues = obj.get('uniqueKeys');
        //_.map(fCds.get('dataSource').getGroup(fCds.get('depth')).all(), function(d) {
        //     return d.key;
        // });

        // Get Data Sets
        // if(data.length == 1) {
        //     // If we have only one data source
        //     chartData = data[0];
        //     row = chartData.length;
        //     var mouseover_key = fCds.get('factDisplay') || fCds.get('fact');
        //     obj.set('mouseover_key', mouseover_key);
        // } else if (data.length == 2) {
        //     // Multiple Data Sources - Combine Both Data Sets                
            
        //     var fCds1 = this.cds.objectAt(1);
        //     obj.set('mouseover_key', fCds1.get('fact') + ' / ' + fCds.get('fact'));
            
        //     var d1=data[0];
        //     var d2=data[1];
        //     // var d1 = _.sortBy(data[0], function(d) {
        //     //     return d.key;
        //     // });
        //     // var d2 = _.sortBy(data[1], function(d) {
        //     //     return d.key;
        //     // });
        //     var chartData = [];
        //     d1.forEach(function(i, i_index) {
        //         d2.forEach(function(e, e_index) {
        //             if (e.key === i.key) {
        //                 row++;
        //                 var i_vals = _.sortBy(i.values, function(d) {
        //                     return d.key;
        //                 });
        //                 var e_vals = _.sortBy(e.values, function(d) {
        //                     return d.key;
        //                 });

        //                 var item = {};
        //                 item.key = i.key;
        //                 item.values = {};
        //                 item.actualData = {};
        //                 item.targetData = {};
        //                 for (var k =0; k < e_vals.length; k++) {
        //                     var v = e_vals[k].val;
        //                     var val = i_vals[k].val != 0 ? v / i_vals[k].val : 0;
        //                     // TODO : Currently supported relation between data sources is ratio
        //                     item.values[k] = {}
        //                     item.values[k].key=i_vals[k].key;
        //                     item.values[k].val = val.toFixed(3);
                            
        //                     item.actualData[k] = v;
        //                     item.targetData[k] = i_vals[k].val;

        //                 }
        //                 chartData.push(item);
        //             }
        //         });
        //     });
        // }

        var d1 = data[0];
        row = d1.length;
        var measures=fCds.get('measures');
        if(measures.get('length')==2){
            obj.set('mouseover_key', measures.objectAt(0).get('displayName') + ' / ' + measures.objectAt(1).get('displayName'));
        }
        else{
            obj.set('mouseover_key', measures.objectAt(0).get('displayName'));
        }

        var chartData = [];
        d1.forEach(function(i, i_index) {
            // row++;
            var i_vals = _.sortBy(i.values, function(d) {
                return d.key;
            });
            var item = {};
            item.key = i.key;
            item.values = {};
            // item.actualData = {};
            // item.targetData = {};
            for (var k =0; k < i_vals.length; k++) {
                var v = i_vals[k].values[0];
                // var val = i_vals[k].val != 0 ? v / i_vals[k].val : 0;
                // TODO : Currently supported relation between data sources is ratio
                item.values[k] = {}
                item.values[k].key=i_vals[k].key;
                var val;
                measures.forEach(function(m, p){
                    m_blob = v[m.get('displayName')]
                    item.values[k][m.get('displayName')]=toFloat(m_blob);
                    if(p==0)
                    {
                        val=toFloat(m_blob);
                    }
                    else{
                        val=(toFloat(m_blob)==0) ? 0 : val/toFloat(m_blob);
                    }
                });
                item.values[k].val=val;
                 // dat[factFormat+"(`"+fact+"`)"]=toFloat(fact_blob[factFormat]);
                // item.values[k].val = val.toFixed(3);
                
                // item.actualData[k] = v;
                // item.targetData[k] = i_vals[k].val;

            }
            chartData.push(item);
        });

        if(chartData)
        {
            _.each(chartData, function(d){
                _.each(d.values,function(v){
                    yValues.push(v.key);
                });
            });
            yValues= yValues.uniq();
            col = yValues.length;
        }        
        var data = [];
        for( var i = 0; i < row; i++ ) {
            for(var j = 0; j < col; j++ ) {
                if(chartData[i]['values'][j]) {
                    var d = {};
                    d.row = i;
                    d.col = j;
                    d.x = chartData[i]['key'];
                    d.y = yValues[j];
                    d.score = chartData[i]['values'][j].val;
                    if(chartData[i]['actualData']) {
                        d.actual = chartData[i]['actualData'][j].toFixed(3);    
                    }
                    if(chartData[i]['targetData']) {
                        d.target = chartData[i]['targetData'][j].toFixed(3);    
                    }
                    data.push(d);
                    
                }
            }
        }

        renderMap(data);
        
        function renderMap(data) {
            xValues = _.map(data, function(d) {
                return (formatDate) ? formatDate(parseDate(d.x)) : d.x;
            });
            // xValues = _.sortBy(xValues, function(d) {
            //     return d;
            // });

            //height of each row in the heatmap
            //width of each column in the heatmap

            var colorSchemeLow = obj.chart.get("configObj").colorSchemeLow ? obj.chart.get("configObj").colorSchemeLow.toLowerCase() : 'red';
            var colorSchemeHigh = obj.chart.get("configObj").colorSchemeHigh ? obj.chart.get("configObj").colorSchemeHigh.toLowerCase() : 'green';
            var colorDomainLow = obj.chart.get("configObj").colorDomainLow;
            var colorDomainHigh = obj.chart.get("configObj").colorDomainHigh; 

            var margin = {top: obj.chart.get('marginTop'), right: obj.chart.get('marginRight'), bottom: obj.chart.get('marginBottom'), left: obj.chart.get('marginLeft')},
                width = obj.chart.get('width'),
                height = obj.chart.get('height');

            // var gridSize = Math.min(Math.floor((width-margin.right-margin.left)/row),Math.floor((height-margin.top-margin.bottom)/col)),
            // var gridSize=obj.get('gridSize'),
                w = Math.floor((width-margin.right-margin.left)/row),
                h = Math.floor((height-margin.top-margin.bottom)/col),
                rectPadding = 1;

            var min = (colorDomainLow && colorDomainHigh) ? parseInt(colorDomainLow) : d3.min(data, function (d) { return d.score;});
            var max = (colorDomainHigh && colorDomainLow) ? parseInt(colorDomainHigh) : d3.max(data, function (d) { return d.score;});
            // var mid = (colorDomainLow && colorDomainHigh) ? ((parseInt(colorDomainLow) + parseInt(colorDomainHigh))/2) : d3.mean(data, function (d) { return d.score;});
            var colorScale = d3.scale.linear()
                 .domain([min,max])
                 .range([colorSchemeLow,colorSchemeHigh]);

            var svg   = obj.chart.getSvgElement();

            var tip = obj.chart.getChartTip();
                tip.offset([-10,0]);
            // var yAxis = obj.chart.drawYAxis(svg, yValues, obj.cds.objectAt(0).get("depth"));
            // var xAxis = obj.chart.drawXAxis(svg, xValues, yAxis(min), 'ordinal');

            // not calling Chart.js drawXAxis and drawYAxis methods bcoz grid lines of axes appear outside the heatmap grids

            var x = d3.scale.ordinal()
                    .rangeRoundBands([0, w * row],0);

            var y = d3.scale.ordinal()
                .rangeRoundBands([0, h * col], 0);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(xValues.length)
                .tickFormat(function(t){
                    var tick=displayTick(t);
                    if(tick.length > 12)
                    {
                        return tick.substr(0,12) + "...";
                    }
                    else{
                        return tick;
                    }
                });

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            x.domain(xValues);
            y.domain(yValues);
        

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + col * h + ")")
                .style('shape-rendering', 'crispEdges')
                .style('fill', 'none')
                .style('stroke', 'black')
                .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
                .style("font-weight", "200")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "1.25em")
                .attr("transform", function(d) {
                    return "rotate(-45)";
                })
                .on('mouseover', function(d) {
                    var div = d3.select("#chart-tooltip");
                    div.transition()
                    .duration(500)
                    .style("opacity", 0.9);
                    var html = displayTick(d);
                    div.html(html)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })
                .on('mouseout',function(d){
                    obj.chart.chartElementOnMouseExit();
                });

            svg.append("g")
                .attr("class", "y axis")
                .style('shape-rendering', 'crispEdges')
                .style('fill', 'none')
                .style('stroke', 'black')
                .style('font', 'sans-serif')
                .style("font-weight", "200")
                .call(yAxis);

            var heatMap = svg.selectAll(".heatmap")
                .data(data)
                .enter().append("svg:rect")
                // .attr("class", "bordered")
                .style("stroke", "#E6E6E6")
                .style("stroke-width","2px")
                .attr("x", function(d) { return d.row * w; })
                .attr("y", function(d) { return d.col * h; })
                .attr("width", function(d) { return (obj.chart.get("width")-obj.chart.get("marginLeft")-obj.chart.get("marginRight"))/row; })
                .attr("height", function(d) { return h; })
                .attr("id", function(d) {
                    if(d.x && d.y) {
                      return "chart-" + obj.chart.id + "-" + d.x+d.y;  
                    }
                })
                .style("fill", function(d) {
                    if(parseInt(colorDomainHigh) && parseInt(colorDomainLow)){
                        if(d.score < parseInt(colorDomainLow)){
                            return colorScale(parseInt(colorDomainLow));
                        }
                        else if(d.score > parseInt(colorDomainHigh)){
                            return colorScale(parseInt(colorDomainHigh));
                        }
                        else{
                            return colorScale(d.score);
                        }
                    }
                    else{
                        return colorScale(d.score);     
                    }
                });

            heatMap.on("click", function(d) {
                // show modal
                var modal_id = obj.element+"-hm-modal";
                var elem = $("#" + modal_id);
                if(elem.length == 0) { 
                    elem = $("<div id='" + modal_id + "'></div>").appendTo($("#" + obj.element));
                }
                elem.html("");
                if(obj.chart.get('modalEnabled')) {
                    if(obj.cds.get('length')==2){
                        elem.append(obj.modalDrillDown(d));
                        $("#modal-" + d.row + "" + d.col).modal('toggle');
                        return;
                    }
                }
                var cds = obj.cds.objectAt(0); 
                // dimensionName = cds.get('dimensionName'),
                // formatAs = cds.get('dimensionFormatAs'),
                // // ret =  obj.getShapeName(d),
                // key = d.x;

                var filterObj=[];

                var filter1 = {};
                filter1.dimension = cds.get('dimensionName');
                filter1.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
                filter1.value = d.x;
                filterObj.push(filter1);

                var filter2={};
                filter2.dimension = cds.get('depth');
                filter2.formatAs = "";
                filter2.value = d.y;

                filterObj.push(filter2);

                var key=d.x;
                var depth=d.y;
                var value = d.score;
                var fact = obj.mouseover_key;

                var data={};
                data.key=key;
                data.value=value;
                data.zkey=depth;

                var otherData={};
                otherData.fact=fact;

                obj.chart.chartElementOnClick((obj.element+"-"+d.x+d.y), filterObj, data, otherData, tip, svg);
                
                // var filter = {};
                // filter.dimension = dimensionName;
                // filter.formatAs = formatAs ? formatAs : "";
                // filter.value = key;
                // obj.chart.chartElementOnClick((obj.element+"-"+d.x+d.y), filter);
            })
            .on("mouseover", function(d) {
                if(!obj.chart.get('notToHideTip')){
                    var key=d.x;
                    var depth=d.y;
                    var value = d.score;
                    var fact = obj.mouseover_key;

                    var data={};
                    data.key=key;
                    data.value=value;
                    data.zkey=depth;

                    var otherData={};
                    otherData.fact=fact;
                    obj.chart.getChartElementData(data,otherData,tip,svg);
                    tip.show();
                }
            })
            .on("mouseout",function(){
                if(!obj.chart.get('notToHideTip')){
                    tip.hide();
                }
            });


            var div = d3.select("body").append("div")
                .attr("class", "chart_tooltip")
                .style("opacity", 0);
    
            svg.selectAll("g.axis")
                .selectAll("text")
                .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
                .style("font-size", "11px")
                .style("letter-spacing", "0px")
                .style("fill", "black")            
                .style("stroke", "none")
                .style("word-wrap", "break-word");
        }

        obj.chart.set('dataLoading', false);
        obj.chart.get('dashboard').highlightFilters();

    },

    /**
      This method prepares and returns the HTML for a modal with drill down data in tabular format.

      @method modalDrillDown
      @return {String} HTML string
    */
    modalDrillDown: function(d) {
        var obj = this,
        cds0 = obj.cds.objectAt(0),
        cds1 = obj.cds.objectAt(1);
        var title = obj.chart.get('modalTitle') || "Summary";
        var html = "<div id='modal-" + d.row + "" + d.col + "' class='modal hide fade'>";        
            html += '<div class="modal-header">';
            html += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
            html += '<h3 id="myModalLabel">' + title + '</h3>';
            // html += '<h3 id="myModalLabel">' + title + ' for ' + d.y +' in ' +d.x + '</h3>';
            html += '</div><!-- modal-header -->';
            html += '<div class="modal-body">';
            html += '<table class="table table-bordered">';
            html += "<tr>";            
            html += "<th>"+ obj.get('dimensionName') +"</th>";
            html += "<th>"+ cds0.get('depth') +"</th>";
            html += "<th>"+ cds0.get('fact') +"</th>";
            html += "<th>"+ cds1.get('fact') +"</th>";
            html += "<th>"+ cds1.get('fact')+"/"+ cds0.get('fact') +"</th>";
            html += "</tr>";
            html += "<tr>";
            html += "<td>"+ d.x +"</td>";
            html += "<td>"+ d.y +"</td>";
            html += "<td>" + d.target + "</td>";
            html += "<td>" + d.actual + "</td>";
            if(d.actual==0)
            {
                html += "<td> NA </td>";
            }
            else{
               html += "<td>" + (d3.format(',.2f')(d.score)) + "</td>"; 
           }            
            html += "<tr>";
            html += '</table>';
            html += '</div><!-- modal-body -->';  
            html += "</div>";
        return html;
    }
});
