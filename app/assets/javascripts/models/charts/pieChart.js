/**
@module charts
@class Cibi.PieChart
*/

/**
  `Cibi.PieChart` is an Ember Object class representing pie chart.

  It contains methods specific to pie chart.

  @class Cibi.PieChart
  @module charts
*/

Cibi.PieChart = Ember.Object.extend({

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

        // if((cds.get('measures').get('length')<1)
        //     || (cds.get('dimensions').get('length')>1) 
        //     || (cds.get('dimensions').get('length')==1 && cds.get('measures').get('length')>1)){
        //     $("#" + obj.element).html("<div class='alert alert-error'>Improper Configuration</div>");
        // }
        // else{
            var data = cds.chartData(obj._drawChart, obj, filters);
            obj.chart.set("isSetup", false);
        // }        
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
      
        data = _.sortBy(data, function(d) {
            return d.key;
        })
        //var rawData = cds.rawData();
        var chart = obj.get('chart');
        chart.clearChart();
        chart.setDateFormats();
        var dsb=chart.get('dashboard');
        if(dsb.get('chartsOnClickFilters').length == 0){
            chart.set('original_keys', data.map(function(d){
                return d.key;   
            }));
        }
        var formatDate=chart.get('formatDate');
        var parseDate=chart.get('parseDate');
        var orgKeys=chart.get('original_keys');
        var keys = data.map(function(d) {
                return d.key;
        });
        
        obj.chart.setChartDomain(keys);

        if(isValidLegendFilter){
          var key = keys[legendFilter];
          var cd = data.map(function(d) {
            var data_key=d.key;
            if(data_key == key) {
              return d;  
            }
          });
            data = cd.filter(function(d) {
              return !(d === "" || typeof d == "undefined" || d === null);
            }); 
        }
        var margin =  {
              top: 0, 
              right: 0, 
              bottom: 0,  
              left: 0, 
            };

        var width  = chart.get('width')  - margin.left - margin.right;
        var height = chart.get('height') - margin.top - margin.bottom;
        
        var center = {
            y: ( height - margin.top - margin.bottom ) / 2,
            x: ( width - margin.left - margin.right ) / 2
        };
        var radius = Math.min(center.x, center.y);
        color = obj.chart.colorScale();     //builtin range of colors
        if(orgKeys){
            color.domain(orgKeys);
        }else{
            color.domain(keys);
        }

        var total_val=0;
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var val = cds.get('factDisplay');
        data.map(function(d)
        {   
            total_val+=d[val];
        });
        var total_val_text="Total sum";
        if(cds.get('factType') == "money") {
            if(cds.get('factUnit')=="USD")
               total_val_text=total_val_text+"<br/> $"+d3.format(',.2f')(total_val);
            else if (cds.get('factUnit') == "Rs")
                total_val_text=total_val_text+"<br/> ₹"+d3.format(',.2f')(total_val);
            else if (cds.get('factUnit') == "Euro")
                total_val_text=total_val_text+"<br/> €"+d3.format(',.2f')(total_val);
            else
                total_val_text=total_val_text+"<br/>"+d3.format(',.2f')(total_val);
        } else {
            total_val_text=total_val_text+"<br/>"+d3.format(',.2f')(total_val);
        }

        var tip = chart.getChartTip();
        
        var svg = d3.select("#" + obj.element)
                .append("svg:svg")                                   //create the SVG element inside the <div>
                    .data([data])                                        //associate our data with the document
                    .attr("width", width)                           //set the width and height of our visualization (these will be attributes of the <svg> tag
                    .attr("height", height)
                    .attr("style", "display:inline;")
                    .append("svg:g")                                         //make a group to hold our pie chart
                    .attr("transform", "translate(" + center.x + "," + center.y + ")");//move the center of the pie chart from 0, 0 to radius, radius
        // svg.call(tip);            
        var arc = d3.svg.arc()                                      //this will create <path> elements for us using arc data
                    .outerRadius(radius);
        // arc.call(tip);
        var pie = d3.layout.pie()                                //this will create arc data for us given a list of values
                    .value(function(d) { 
                        return d[val]; 
                    });    //we must tell it out to access the value of each element in our data array
        var arcs = svg.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
                    .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
                    .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
                    .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                    .attr("class", "slice");    //allow us to style things in the slices (licds.get('loan_amount')
        // arcs.call(tip);
        arcs.append("svg:path")
            .attr("fill", function(d, i) { 
                return color(d.data.key);
             } ) //set the color for each slice to be chosen from the color function defined above
            .attr("stroke", function(d, i) { 
                return d3.rgb(color(d.data.key)).darker();
             } ) //set the color for each slice to be chosen from the color function defined above
           .attr("d", arc)                                     //this creates the actual SVG path using the associated data (pie) with the arc drawing function
            .attr("id", function(d) {
              return "chart-" + obj.chart.id + "-" + ((formatDate) ? pruneStr(formatDate(parseDate(d.data.key))) : pruneStr(d.data.key));
            })

            .on("mouseover",function(d) {
                if(!obj.chart.get('notToHideTip')){
                    var otherData={};
                    otherData.total_val=total_val;
                    chart.getChartElementData(d.data,otherData,tip,svg);
                    tip.show();
                }
            })
            .on("mouseout", function(){
                if(!obj.chart.get('notToHideTip')){
                    tip.hide();
                }
            })
            .on("click", function(d) {
                var filter = {};
                filter.dimension = cds.get('dimensionName');
                filter.formatAs = cds.get('dimensionFormatAs') ? cds.get('dimensionFormatAs') : "";
                filter.value = d.data.key;

                var otherData={};
                otherData.total_val=total_val;

                obj.chart.chartElementOnClick(this.id, filter, d.data, otherData, tip, svg);
            });          

        obj.chart.drawChartLegend(keys, color, true);
        obj.chart.set('dataLoading', false);
        obj.chart.get('dashboard').highlightFilters();
    }
});
