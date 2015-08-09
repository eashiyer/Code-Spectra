/**
@module charts
@class Cibi.HorizontalBarChart
*/

/**
  `Cibi.HorizontalBarChart` is an Ember Object class representing horizontal bar chart.

  It contains methods specific to horizontal bar chart.

  @class Cibi.HorizontalBarChart
  @module charts
*/
Cibi.HorizontalBarChart = Ember.Object.extend({
	_chart: null,

	init: function() {
		if(!this.element) {
			throw new Error("Need to specify element id");
		}

		if(this.plot_pc) {
			if(!this.control_key) {
				error_msg = "<h4 class='alert alert-error'>Need to specify a control key to plot Percent Change in Value</h4>";
				$("#" + this.element).html(error_msg);
				this.set('error', true);
			}
		}
	},

    draw: function() {
		if(this.get('error')) {
			return;
		}
      var obj = this;      
      var filters = obj.chart.getFilters();
      var cds = obj.cds.objectAt(0);
      obj.chart.set('dataLoading', true);
        cds.chartData(obj._chartDataCallback, obj, filters);
        var depth = cds.get('depth');
        var depthFormat = cds.get('depthFormat');
	    obj.chart.set("isSetup", false);
    },

    _chartDataCallback: function(data, obj) {
        obj.set('chartData', data);
		obj.set('uniqueKeys', obj.chart.get('depth_unique_values'));
        obj.checkDataAndDrawChart();
    },

    checkDataAndDrawChart: function() {
        var obj = this;
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        var chartData = obj.get('chartData');
        var uniqueKeys = obj.get('uniqueKeys');
        var depth = cds.get('depth');
        if(depth){
          if(chartData && uniqueKeys) {
              var data = chartData;
              data = cds.stackData(data, uniqueKeys);
              obj._drawHorizontalBarChart(data, obj);
          }
        }else {
          if(chartData) {
              var data = this.get('chartData')
              obj._drawHorizontalBarChart(data, obj);
          }
        }
    },    
    /**
      This method draws a horizontal bar chart within the html element specified in configObj.

	  @method draw
    */
	_drawHorizontalBarChart: function(chartData, self) {
		var obj = self;
		var color_keys, orgzKeys;
		var max_bar_height = 30;
		
		$("#" + obj.element).html("");
		var chart = obj.chart;
	    var filters = obj.chart.getFilters();
	    
		var legendFilter = obj.chart.get('legendFilter');
		legendFilter = legendFilter ? legendFilter.index : legendFilter;
		var isValidLegendFilter = legendFilter !== undefined && legendFilter !== false && legendFilter !== null ;

		var margin = {
					top: obj.chart.get('marginTop'), 
					right: obj.chart.get('marginRight'), 
					bottom: obj.chart.get('marginBottom'), 
					left: obj.chart.get('marginLeft')
				},
	    	width = obj.chart.get('width') - margin.left - margin.right,
	    	height = obj.chart.get('height') - margin.top - margin.bottom;

		var x = d3.scale.linear()
		    .range([0, width])

		var y = d3.scale.ordinal()
		    .rangeRoundBands([0, height], .1);

		var xAxis = d3.svg.axis()
		    .scale(x)
	    	.tickFormat(function(d) {

            	return formatValue(d,((obj.chart.get('axesConfigsObj') && obj.chart.get('axesConfigsObj').xAxisDisplayUnit) ? obj.chart.get('axesConfigsObj').xAxisDisplayUnit : ""));
	      	})
		    .orient("top");

		var svg   = obj.chart.getSvgElement();
		var cds = obj.cds.objectAt(0);
		var depth = cds.get('depth');
		var data = chartData;
		var zKeys = [];
		var val=obj.chart.get('measures').objectAt(0).get('displayName');

		var tip = obj.chart.getChartTip();
			tip.offset([-10,0]);

		if(depth) {
			zKeys = _.map(data, function(d) {
				return d.zkey;	
			});
			zKeys = zKeys.uniq();
			color_keys =  obj.get('uniqueKeys');
			orgzKeys=obj.chart.get('original_zkeys');
			// if(orgzKeys){
   //          	color.domain(orgzKeys);
   //      	}else{
   //          	color.domain(zKeys);
   //      	}
		}
		 
		if(isValidLegendFilter) {
		  data = _.filter(data, function(d) { return d.zkey == zKeys[legendFilter] }); 
		}
		
		if(obj.plot_pc && data.length > 0) {
			var baseVal = _.filter(data, function(d) {
				return d.key == obj.control_key;
			});
		
			var base_value = 0;
			if(baseVal && baseVal.length > 0) {
	 			if( baseVal.length === 1 ) {
					base_value = baseVal[0][val];
				} else {
					// We have a depth specified
					base_value = {};
					for(var i=0; i < baseVal.length; i++) {
						base_value[baseVal[i].zkey] = baseVal[i][val];
					}
				}
			} else {
				obj.chart.displayChartError("Chart can not be rendered with current settings / filters!");
				return;
			}

			_.each(data, function(d) {
				var b_val;
				if(d.zkey && baseVal.length !== 1) {
					b_val = base_value[d.zkey];
				} else {
					b_val = base_value;
				}
				if(b_val) {
					d[val] = ( d[val] - b_val ) * 100 / b_val;	
				}
			});

			//obj.set('sort_by_key', true);
		}
		// } else {
		// 	obj.chart.displayChartError("Chart can not be rendered with current settings / filters!");
		// 	return;
		// }

        // if(chart.get('sortByKey') == 'true') {
        //   data = _.sortBy(data, function(d) {
        //       return   sortStringFormat(d.key); // parseInt(d.key.replace(/[A-Za-z\-]/g, ''));
        //   });
        // } else {
        //   data = _.sortBy(data, function(d) {
        //       return d[val];
        //   });          
        // }
        // if(chart.get('descOrder')) {
        //   data.reverse();
        // }

		var fact_format = cds.get('factFormat');

		var colorScale = obj.chart.colorScale();
		if(depth) {
			colorScale.domain(orgzKeys);
	        obj.chart.drawChartLegend(color_keys, colorScale,true);
		}

		var dataRange=d3.extent(data, function(d) { 
				return d[val] ; 
			});			
		if(dataRange[0] > 0) {
			dataRange[0] = 0;
		}
		if(obj.chart.get('axesConfigsObj') 
			&& obj.chart.get('axesConfigsObj').xDomainMinValue
			&& obj.chart.get('axesConfigsObj').xDomainMaxValue
			&& obj.chart.get('axesConfigsObj').xDomainMinValue < obj.chart.get('axesConfigsObj').xDomainMaxValue){ 
			if(obj.chart.get('axesConfigsObj').xDomainMinValue > dataRange[0]){
    			x.domain([obj.chart.get('axesConfigsObj').xDomainMinValue,obj.chart.get('axesConfigsObj').xDomainMaxValue]).nice();
			}
			else{
				x.domain([dataRange[0],obj.chart.get('axesConfigsObj').xDomainMaxValue]).nice();
			}
    	}
    	else{    		
    		x.domain(dataRange).nice();
    	}

		y.domain(data.map(function(d) { 
			return d.key; 
		}));
		var xLabel=(obj.chart.get('axesConfigsObj') && obj.chart.get('axesConfigsObj').xAxisLabel) ? obj.chart.get('axesConfigsObj').xAxisLabel : "";
	   
	   var format=chart.getTextFormatting();

	   
	   var a= svg.append("g")
        	.attr("class","x axis")
        	.style('shape-rendering', 'crispEdges')
            .style('fill', 'none')
            .style('stroke', 'black')
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
		  	.call(xAxis);

	       a.append("text")
	        .style("font-weight", "bold")
	       
	        .attr("y", 5)
	        .attr("x", width/2)
	        .attr("dy", format.dy)
	        .style("text-anchor", format.text_anchor)
	        .text((xLabel.length>20)? xLabel.substr(0,20): xLabel); 
	        	
			a.selectAll("text")
			.style("text-anchor", "start")
			.attr("dx", format.dx)
			
				.attr("transform", function(d) {
            	var rotateAngle=(obj.chart.get('axesConfigsObj') && obj.chart.get('axesConfigsObj').xAxisRotateAngle) ? (obj.chart.get('axesConfigsObj').xAxisRotateAngle) : 45;
            	return "rotate(-"+rotateAngle+")";
            })
			.on('mouseover', function(d) {
				var otherData={};
				obj.chart.getChartElementData(d,otherData,tip,svg);
				tip.show();
			})
			.on('mouseout',tip.hide);

		svg.append("g")         
	        .attr("class", "x grid")
	        .style('shape-rendering', 'crispEdges')
            .style('fill', 'none')   
            .style("stroke","black")         
	        .call(xAxis.tickSize(-height, 0, 0).tickFormat(""));

	    svg.selectAll(".x.grid")
	    	.selectAll("line")
            .style('stroke', '#ebebeb')
            .style("stroke-dasharray","2,2");

	    svg.selectAll(".x.grid")
	    	.selectAll("path")
	    	.style("opacity",0);
	    
	    var start;

	    obj.chart.addClipPathElement(svg);
	    obj.chart.setDateFormats();

	    if(obj.chart.get('axesConfigsObj') 
	    	&& obj.chart.get('axesConfigsObj').xDomainMinValue
	    	&& obj.chart.get('axesConfigsObj').xDomainMaxValue
	    	&& obj.chart.get('axesConfigsObj').xDomainMinValue < obj.chart.get('axesConfigsObj').xDomainMaxValue){

	    	if(obj.chart.get('axesConfigsObj').xDomainMinValue>0){
    			start=obj.chart.get('axesConfigsObj').xDomainMinValue;					    		
	    	}
	    	else if(obj.chart.get('axesConfigsObj').xDomainMaxValue<0){
	    		start=obj.chart.get('axesConfigsObj').xDomainMaxValue;
	    	}
	    	else{
	    		start=0;
	    	}
    	}
    	else{
    		start=0;
    	}

		svg.append("g")
            .attr("class", "y axis")
            .style('shape-rendering', 'crispEdges')            
            .style('stroke', 'black')
            .style('fill', 'none')
            .style("font-weight", "200")
            .append("line")
			// .attr("x1", x(start))
			// .attr("x2", x(start))
			.attr("x1", start)
			.attr("x2", start)			
			.attr("y2", height);

	    svg.selectAll(".axis")
	    	.selectAll("text")
	    	.style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
	    	.style("font-size", "11px")
	    	.style("letter-spacing", "0px")
	        .style("fill", "black")            
	        .style("stroke", "none")
	        .style("word-wrap", "break-word");

		svg.selectAll(".bar")
			.data(data)
			.enter()
			.append("svg:rect")
			.attr("class", function(d) { 
				return d[val] < 0 ? "bar negative" : "bar positive"; 
			})
			.attr("id", function(d) {
				return "chart-" + obj.chart.id + "-" + pruneStr(d.key);
			})
			.attr("clip-path", obj.chart.getClipPathUrl())
			.style("fill", function(d) {
				if(obj.control_key && d.key == obj.control_key) {
					return obj.chart.controlKey();
				}
				if(d.zkey) {
					var n = zKeys.indexOf(d.zkey);
					return colorScale(d.zkey);
				} else {
					return d[val] < 0 ? obj.chart.red() : obj.chart.green();	
				}
			})
			.attr("x", function(d) { 
				if(obj.chart.get('axesConfigsObj') 
					&& obj.chart.get('axesConfigsObj').xDomainMinValue
					&& obj.chart.get('axesConfigsObj').xDomainMaxValue 
					&& obj.chart.get('axesConfigsObj').xDomainMinValue < obj.chart.get('axesConfigsObj').xDomainMaxValue
					&& d[val]<obj.chart.get('axesConfigsObj').xDomainMinValue){
					if(obj.chart.get('axesConfigsObj').xDomainMinValue > dataRange[0]){
						return x(obj.chart.get('axesConfigsObj').xDomainMinValue);
					}
					else{
						return x(dataRange[0]);
					}
				}
				else{
					return x(Math.min(start, d[val])); 
				}
			})
			.attr("y", function(d, i) { 
				if(d.zkey && !isValidLegendFilter) {
					var index = i % zKeys.length;
					var height = y.rangeBand() / zKeys.length;
					return y(d.key) + index*height;
				}
				return y(d.key); 
			})
			.attr("width", function(d) { 
				// console.log(d[val]);
				// return Math.abs(x(d[val]) - x(0));
				if(d[val]) {
					if(obj.chart.get('axesConfigsObj') 
						&& obj.chart.get('axesConfigsObj').xDomainMinValue
						&& obj.chart.get('axesConfigsObj').xDomainMaxValue
						&& obj.chart.get('axesConfigsObj').xDomainMinValue < obj.chart.get('axesConfigsObj').xDomainMaxValue){
						if(d[val] > 0){
							if(d[val] < obj.chart.get('axesConfigsObj').xDomainMinValue) {
				            	return 0;
				            }
				            else if(d[val] > obj.chart.get('axesConfigsObj').xDomainMinValue && 
				            	d[val] < obj.chart.get('axesConfigsObj').xDomainMaxValue){
				            	return Math.abs(x(d[val]) - x(start));
				            }
				            else if(d[val] > obj.chart.get('axesConfigsObj').xDomainMaxValue){
				            	return Math.abs(x(obj.chart.get('axesConfigsObj').xDomainMaxValue)-x(obj.chart.get('axesConfigsObj').xDomainMinValue));
				            }
				            else{
				            	return Math.abs(x(d[val]) - x(0));
				            }	
						}
						else if(d[val] < 0){
							if(d[val] < obj.chart.get('axesConfigsObj').xDomainMinValue) {
				            	return Math.abs(x(obj.chart.get('axesConfigsObj').xDomainMinValue)-x(start));				            	
				            }
				            else if(d[val] > obj.chart.get('axesConfigsObj').xDomainMinValue && 
				            	d[val] < obj.chart.get('axesConfigsObj').xDomainMaxValue){
				            	return Math.abs(x(d[val]) - x(start));
				            }
				            else if(d[val] > obj.chart.get('axesConfigsObj').xDomainMaxValue){
				            	return 0;
				            }
				            else{
				            	return Math.abs(x(d[val]) - x(0));
				            }
						}
						else{
							return Math.abs(x(d[val]) - x(0));
						}						
					}
					else{
						return Math.abs(x(d[val]) - x(0));
					}
				}
			})
			.attr("height", function(d) {
				var height = y.rangeBand()	;
				if(d.zkey && !isValidLegendFilter) {
					height = y.rangeBand() / zKeys.length;
				}

				return height > max_bar_height ? max_bar_height : height;
			})
			.on('mouseover', function(d) {
				if(!obj.chart.get('notToHideTip')){
					var otherData={};
					obj.chart.getChartElementData(d,otherData,tip,svg);
					tip.show();
				}
			})
			.on('mouseout',function(){
				if(!obj.chart.get('notToHideTip')){
					tip.hide();
				}
	        })
			.on('click', function(d) {
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
			});
			if(obj.display_error_range) {
				svg.selectAll(".error_bars")
					.data(data)
					.enter()
					.append("svg:line")
					.style("fill", function(d) {
						if(d.zkey && !isValidLegendFilter)  {
							return obj.chart.errorBar();		
						}
						return obj.chart.errorBar();		// "#222222";
					})
					.style("stroke", function(d) {
						if(d.zkey && !isValidLegendFilter) {
							return obj.chart.errorBar();		
						}
						return obj.chart.errorBar();		//"#222222";
					})
					.attr("x1", function(d) { 
						return x(Math.min(0, d[val] - d.sem *1.96)); 
					})
					.attr("y1", function(d, i) { 
						if(d.zkey && !isValidLegendFilter) {
							var index = i % zKeys.length;
							var height = y.rangeBand();
							return y(d.key) + index*height + height/2;
						}
						return y(d.key) + y.rangeBand(); 
					})
					.attr("y2", function(d, i) { 
						if(d.zkey && !isValidLegendFilter) {
							var index = i % zKeys.length;
							var height = y.rangeBand();
							return y(d.key) + index*height + height/2;
						}
						return y(d.key) + y.rangeBand(); 
					})
					.attr("x2", function(d) { 
						return x(Math.min(0, d[val] + d.sem *1.96)); 
						//return Math.abs(x(d.sem * 2 * 1.96) - x(0));
						// return Math.abs(x(d[val]) - x(0)); 
					})
					// .attr("height", function(d) {
					// 	if(d.zkey) {
					// 		return y.rangeBand() / zKeys.length;
					// 	}
					// 	return y.rangeBand()	
					// })
		            .on("mouseover", function(d) {
		              var details="<br>Error Range: "+ d.sem * 1.96 + "/ -" +  d.sem * 1.96 ;
		              var otherData={};
		              otherData.details=details;
		              obj.chart.getChartElementData(d,otherData,tip,svg);
		              tip.show();
		            })
		            .on("mouseout",tip.hide);
			}

		if(y.rangeBand() > 4) {
			svg.selectAll(".bar_labels")
				.data(data)
				.enter()
				.append("svg:text")
				.style("text-anchor", "end")
				.attr("x", function(d) { 
					return -12;
					if(obj.chart.get('axesConfigsObj') 
						&& obj.chart.get('axesConfigsObj').xDomainMinValue
						&& obj.chart.get('axesConfigsObj').xDomainMaxValue 
						&& d[val]<obj.chart.get('axesConfigsObj').xDomainMinValue
						&& obj.chart.get('axesConfigsObj').xDomainMinValue < obj.chart.get('axesConfigsObj').xDomainMaxValue){
						if(obj.chart.get('axesConfigsObj').xDomainMinValue > dataRange[0]){
							return x(obj.chart.get('axesConfigsObj').xDomainMinValue);
						}
						else{
							return x(dataRange[0]);
						}
					}
					else{
						return x(Math.min(start, d[val])); 
					}
				})
				.attr("y", function(d, i) {
					var bar_height = y.rangeBand() > max_bar_height ? max_bar_height : y.rangeBand();
					if(d.zkey && !isValidLegendFilter) {
						var index = i % zKeys.length;
						var height =  bar_height / zKeys.length;
						return  y(d.key) + index * height + ( height / 1.2 );
					}
					return y(d.key) + bar_height / 2; 
				})
				.attr("dy", "0.35em")
				.attr("clip-path", obj.chart.getClipPathUrl())
				.style("fill", function(d) {
					if(obj.control_key && d.key == obj.control_key)	{
						return "#222222";
					}
					if(d.zkey) {
						return "#666666";	
					}
					return "#000000";
				})
				.style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
			    .style("font-size", function(d) {
			    	var max_font_size = 11;
			    	var font_size = 11;
				    if(d.zkey && !isValidLegendFilter) {
						 font_size = y.rangeBand() / ( zKeys.length * 1.5); 
					} else {
						font_size = y.rangeBand() / 1.5 ;	
					}
			    	font_size = font_size > max_font_size ? max_font_size : font_size ;
			    	return font_size + "px";
			    })		
			    .style("font-weight", "200")
				.text(function(d) {
					var display_text = d.key;
					if(d.zkey && !isValidLegendFilter) {
						display_text = d.key + " : " + d.zkey;
					}
		      		if(display_text && display_text.length > 12)
		      		{
		      			display_text =  display_text.substr(0,12) + "...";
		      		}

					return display_text;
				})
				.on('mouseover', function(d) {
					var otherData={};
					obj.chart.getChartElementData(d,otherData,tip,svg);
					tip.show();
				})
				.on('mouseout',tip.hide);
		}
		obj.chart.set('dataLoading', false);
		obj.chart.get('dashboard').highlightFilters();
	}
});