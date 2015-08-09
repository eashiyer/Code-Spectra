	/** 
	*@class Cibi.ChartController
	*/

	/**
	  `Cibi.ChartController` is the controller class for `chart` model.

	  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
	  Templates know about controllers and controllers know about models, but the reverse is not true.
	  
	  @class Cibi.ChartController
	  @extends Ember.ObjectController
	*/
	Cibi.ChartController = Ember.ObjectController.extend({
		/**
		  Deletes the chart from the server and updates the dashboard

		  @method delete
		  @param null
		  @return null 
		*/
		delete: function() {
			var r = confirm("Are you sure you want to delete this chart?");
			if(r == true) {
				var obj = this;
				var chart = this.get('content');
				var dashboard = chart.get('dashboard');
				var cds = chart.get('chartsDataSources');
				var dimensions=chart.get('dimensions');
				var measures=chart.get('measures');
				var store = this.get('store');

				var length = cds.get('length');
				// Delete the record
				chart.deleteRecord();
				if(store) {
					cds.forEach(function(ds) {
						store.unloadRecord(ds);	
					});
					dimensions.forEach(function(dim){
						store.unloadRecord(dim);
					});
					measures.forEach(function(mes){
						store.unloadRecord(mes);
					});
				}
				chart.on('didDelete', function() {
					obj.transitionToRoute('dashboard.charts', dashboard);
				});
		    	store.commit();
				
			}
		},


	   toggleDrill: function() {
	   	var obj = this;
	   	var chart = this.get('content');
	   	if (chart.get('modalEnabled') == true)
	    	{		   	
	           chart.set('modalEnabled', 0);
	           chart.get('store').commit();     
	           $("#" + this.get('drillId')).parent().attr("style","");
		       $("#" + this.get('drillId')).attr('data-original-title','On Click Drill Through Disabled');

	    	}
	    	else
	    	{
	        	chart.set('modalEnabled', 1);
	    		chart.get('store').commit();
	    		$("#" + this.get('drillId')).parent().attr("style","background-color:green");
	    		$("#" + this.get('drillId')).attr('data-original-title','On Click Drill Through Enabled');
	 
	    	}
	    	
	      		
	  	},
	

	  	download_table_as_image: function(){
	  		var obj = this;
	  		id = '#pivot-table-chart-' + this.get('id');	  		
	  		if(this.get("chartType")==14){
	  			var div = document.createElement('div');
	  			div.setAttribute("id", "temp-img");	
	  			var top_row = document.createElement("div");
	  			top_row.className = "row";
	  			//chart logo
  				var logo_src = Cibi.Auth.currentUser.get('get_company_logo_url');
  				if(logo_src && logo_src.length > 0){
  					var logo_div = document.createElement("div");
		  			logo_div.className = "span";
		  			$(logo_div).addClass("pull-left");
			        var logo = new Image();
			        logo.src = logo_src;
			        logo.setAttribute("width","200px");
			        logo.setAttribute("height","50px");
			        logo_div.appendChild(logo);
			        top_row.appendChild(logo_div)
  				}
	  			//chart description
	  			var desc_text = obj.get('content').get('description');
		      	if(desc_text && desc_text.length > 0){
		      		var desc_div = document.createElement("div");
		      		desc_div.className = "span";
		      		$(desc_div).addClass("pull-right");
		      		desc_div.setAttribute("style", "width:25%;");
		      		$(desc_div).html("<span><p style='text-align:right;'>"+desc_text+"</p></span>");
		      		top_row.appendChild(desc_div);
		      	}
		      	div.appendChild(top_row);
	  			//chart title
	  			var title = this.get('title');
		      	if(title) {
		      		$(div).append("<div class='row'><div style='color:#2093cc;font-family:16px Roboto-Light;padding-bottom:5px;'>"+title+"</div></div>");
		      	}
	  			//chart subtitle
	  			if(this.get('subtitle')){
		      		$(div).append("<div class='row'><div style='color:#7c7c7c;font-family:16px Roboto-Light;padding-bottom:5px;'>"+this.get('subtitle')+"</div></div>");
		      	}
	  			//chart
		      	var table_chart = $(id).clone()
				var floatThead_container = table_chart.find(".floatThead-container");
				floatThead_container.find("thead").css("border-top", "2px solid #DCDCDC");
				table_chart.find(".floatThead_container").remove();
				table_chart.find("thead").html(floatThead_container.find("thead").html());
	  			$(div).append(table_chart);
	  			$(div).find(id).removeAttr("style");
	  			$(div).find(id).find(".pvtTable").css("border-top", "2px solid #DCDCDC");
	  			$(div).find(id).find(".pvtTable").css("border-right", "1px solid #DCDCDC");
	  			$(div).find(id).find(".pvtTable").css("border-bottom", "1px solid #DCDCDC");
	  			$(div).find("*").removeClass("clickableCells");
	  			$(div).find("th.pvtAxisLabel:contains('Measure')").text("Values");
				$('body').append($(div));
	  			height = $("#temp-img").find(id).find("table").height() + 150;
	  			width = $("#temp-img").find(id).find("table").width() + 40;
	  			div.setAttribute("style", "padding:50px;background-color:white;height:"+height+"px;width:"+width+"px;");			
				html2canvas($(div), {
				    onrendered: function (canvas) {
				    	$( "#temp-img" ).remove();
				        var data = canvas.toDataURL('image/jpeg');
				        var orientation = (width > height) ? 'l' : 'p'
				        var doc = new jsPDF(orientation, 'pt', [(width+50), (height+50)]);
						doc.addImage(data, 'JPEG', 15, 10, width, height);
						doc.save(title + ".pdf");
					    // var link=document.createElement("a");
					    // link.href=data;
					    // link.download=obj.get("title")+".png";
					    // document.body.appendChild(link);
					    // link.click();
				    }
				});
		  	}

	  	},

		// downloadable: function() {
		// 	return !['0', 'table'].contains(this.get('chartType'))
		// }.property('configObj'),

		/**
		  Downloads the chart as png image.

		  @method download
		  @param null
		  @return null 
		*/
		download: function() {
			if(['14'].contains(this.get('chartType'))){
				this.download_table_as_image();
				return
			}
			var chart_id = '#chart-' + this.get('id');

			var legend_elem = $("#" + this.get('legendId'));

    	    var legend = $(legend_elem.find(".legend_rect").children())
			var chart_config = this.get('configObj');
		    var canvgOptions    = {
		        ignoreAnimation    :    true,
		        ignoreMouse        :    true,
		        ignoreClear        :    true,
		        ignoreDimensions   :    true,
		        offsetX            :    20,
		        offsetY            :    30
		    };		
		    var textWidth=0;
			_.each(legend,function(l){
				var e=$(l);
				if(e.attr('data-original-title').length>textWidth){
					textWidth=e.attr('data-original-title').length;	
				}
			});
			var lineheight = 17;
		    var width = this.get('width');
		    var height = this.get('height');
			var c = document.createElement('canvas');
			var has_legend = this.get('hasLegend');
			c.width = width + 30;
			c.height = has_legend ? height + 60 + (lineheight*(Math.ceil(((10*textWidth + 38) * legend.length)/width)+5)) : height + 60; 

			var context = c.getContext('2d');
			context.font = '12pt Roboto-Light';
			context.translate(0.5, 0.5);
			context.fillStyle = 'white';
			context.fill();
	      	context.fillRect(0, 0, c.width, c.height);
	      	context.stroke();
	      	
	      	if(this.get('title')) {
	      		context.fillStyle = "#2093cc";
	      		context.font="16pt Roboto-Light";
	      		context.fillText(this.get('title'), 15, 30);	
	      	}

	      	if(this.get('subtitle')){
	      		context.fillStyle="#7c7c7c";
	      		context.font="12pt Roboto-Light";
	      		context.fillText(this.get('subtitle'), 15, 50);
	      	}

	      	if(this.get('hasLegend')) {
	      	   
	      	    var x = 20;
				var y = height+50;
		      	for(var i = 0; i < legend.length; i++) {
					
					var e = $(legend[i]);
		      		
		      		if((x+13+(10*textWidth) + 5)>c.width){
		      			x=20;
		      			y=y+lineheight;
		      		}
					
					context.font="8pt Roboto-Light";
					context.fillStyle=e.attr('style').split(":")[1];
					context.fillRect(x, (y + lineheight-8), 10, 10);
					x=x+13;
				    context.fillStyle="black";
					context.fillText(e.attr('data-original-title'),  x, y + lineheight); 
					x=x+(10*textWidth) + 5;
				}	      			
	      	}
	      	context.font="9pt Roboto-Light";

	      	var margin_top=this.get("marginTop");
		   	var margin_left=this.get("marginLeft");
		   	// this.set("marginTop",40);
		   	// this.set("marginLeft",50);
		   	if(this.get("chartType")!=2 && this.get("chartType")!=15 && this.get("chartType")!=20){
		   		$($(chart_id).find("svg").find("g")[0]).attr("transform","translate("+((margin_left>50) ? margin_left : 50)+","+((margin_top>40) ? margin_top : 40)+")");
		   	}

			canvg(c, $(chart_id).html(), canvgOptions);		   	
		    
		    // var dataURL = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
		    var dataURL=c.toDataURL("image/png");
		    
		    if(this.get("chartType")!=2 && this.get("chartType")!=15 && this.get("chartType")!=20){
		    	$($(chart_id).find("svg").find("g")[0]).attr("transform","translate("+margin_left+","+margin_top+")");
		    }


		    var link=document.createElement("a");
		    link.href=dataURL;
		    link.download=this.get("title")+".png";
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		},

		downloadData: function(){
			var obj=this;
			var chart=obj.get('content');
			var cds=chart.get('chartsDataSources').objectAt(0);
			var data=_.clone(chart.get('dbAggregatedData'));
			var forecast=chart.forecast;
			var formatDate=chart.get('formatDate');
			var parseDate=chart.get('parseDate');
			var downloadableData;
			if(forecast){
				var jsonArr=[];
				_.each(data, function(d){
					var json={};
					json[cds.get('dimensionDisplay')]=formatDate(parseDate(d[cds.get('dimensionDisplay')]));
					// json[cds.get('dimensionDisplay')]=formatDate(parseDate(d.key));
					json[cds.get('factDisplay')]=d[cds.get('factDisplay')];
					json["Value Type"]="Base Data";
					json["Lower Bound"]="";
					json["Upper Bound"]="";
					jsonArr.push(json);
				});
				_.each(forecast, function(f){
					var json={};
					json[cds.get('dimensionDisplay')]=formatDate(parseDate(f.key));
					json[cds.get('factDisplay')]=f.mean;
					json["Value Type"]="Predicted Data";
					json["Lower Bound"]=f.lower;
					json["Upper Bound"]=f.upper;
					jsonArr.push(json);
				});
				downloadableData=jsonArr;
			}
			else{
				downloadableData=[];
				_.each(data, function(d){
					var dat={};
					for (var property in d){
						if(typeof d[property] != "object"){
	    					dat[property] = d[property];
	    				}
	    			}
	    			downloadableData.push(dat);
				});
				
				chart.get('dimensions').forEach(function(dim){
					var formats=chart.getDateFormatFunctions(dim);
					formatDate=formats["formatDate"];
					parseDate=formats["parseDate"];
					if(formatDate){
						_.each(downloadableData,function(d){
						  d[dim.get('displayName')]=formatDate(parseDate(d[dim.get('displayName')]));
						});
					}
				});
			}

			var csv=obj.JSON2CSV(downloadableData);
			var filename=chart.get('title')+".csv";
			obj.downloadAsCSV(csv, filename, "text/csv");
		},

		JSON2CSV: function(objArray) {
			var obj = this;
			var chart = obj.get('content');
			var dimensions = chart.get('dimensions').toArray();
			var measures = chart.get('measures').toArray();
			var keys = dimensions.concat(measures);
			keys = _.map(keys, function(key){
				return key.get('displayName');
			});
		    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
		    var str = '';
		    var line = '';
		    _.each(keys, function(key){
		    	var value = key + "";
		    	line += '"' + value.replace(/"/g, '""') + '",';
		    });
	        line = line.slice(0, -1);
	        str += line + '\r\n';
		    for (var i = 0; i < array.length; i++) {
	        	var line = '';
	        	_.each(keys, function(key){
	        		var value = (array[i][key]) ? array[i][key] : "";
	                line += '"' + value.replace(/"/g, '""') + '",';
	        	});
		        line = line.slice(0, -1);
		        str += line + '\r\n';
		    }
		    return str;
		},

		downloadAsCSV: function(content, filename, contentType)
		{
		    if(!contentType) contentType = 'application/octet-stream';
		        var a = document.createElement('a');
		        var blob = new Blob([content], {'type':contentType});
		        a.href = window.URL.createObjectURL(blob);
		        a.download = filename;
		        a.click();
		},


		/**
		  Updates chart attributes, title and subtitle currently, on the server

		  @method updateChart
		  @param {Integer} id
		  @param {Object} data javascript object
		  @return null 
		*/
		updateChart: function(id, data) {
			var c = Cibi.Chart.find(id);
			var title = data.title || "",
			subtitle = data.subtitle || "";
			c.set('title', title);
			c.set('subtitle', subtitle);				
			c.on('didUpdate', function() {
				c.draw();
			})
			c.get('store').commit();
		},



	/**
	  Returns current filter for the chart.

	  @method currentFilter
	  @param null
	  @return null
	*/
	currentFilter: function() {
		var filter = this.get('chartFilter') || 'Reset';
		if(filter.length>20)
		{
			filter=filter.substr(0,20);
		}
		return filter;
	}.property('chartFilter'),

	isXAxisScaleOrdinal: function(){
		if(this.get('content').get('scale_type')=="ordinal")
    	{
    		return "disabled";
    	}
    	else{
    		return false;
    	}
    }.property('content.scale_type'),

    isYAxisScaleOrdinal: function(){
    	if(this.get('content').get('chartType')=="10" || this.get('content').get('chartType')=="horizontal-bar"){
    		return true;
    	}
    	else{
    		return false;
    	}
    }.property('content.scale_type'),

    disabledTooltip: function(){
    	if(this.get('content').get('scale_type')=="ordinal")
    	{
    		$("#"+this.get('content').get('containerId')).find("div[name='xDomainMinValue']").tooltip();
    		$("#"+this.get('content').get('containerId')).find("div[name='xDomainMaxValue']").tooltip();
    		return "Not valid for ordinal scale charts";    		
    	}
    	else{
    		return "";
    	}
    }.property('content.scale_type'),


    isNotLinearScale: function(){
    	if(this.get('content').get('scale_type')=="linear"){
    		return false;
    	}
    	else{
    		return true;
    	}
    }.property('content.scale_type'),


	/**
	  Resets the chart(removes all filters) by calling reset on Cibi.Chart.

	  @method reset
	  @param null
	  @return null 
	*/
	reset: function(filter) {		
		this.get('content').reset(filter);
	},

	/**
	  Resets the chart's legend filter by calling resetLegendFilter on Cibi.Chart.

	  @method reset
	  @param null
	  @return null 
	*/
	resetLegendFilter: function() {
		this.get('content').resetLegendFilter();
	},

	/**
	  Draws the chart. Calls `draw` on Cibi.Chart.

	  @method draw
	  @param null
	  @return null 
	*/
	draw: function() {
		try {
			this.set('errorMessage', null);
			this.get('content').draw();	
		} catch (err) {
			this.set('errorMessage', err);
			return;
		}
		
	},	


	downloadable: function() {
		$(".sample_link").tooltip();
		return !['0', '7'].contains(this.get('chartType'))
	}.property('configObj'),

	onlyDataDownloadable: function(){
		return (this.get('chartType') == "0");
	}.property('configObj'),

	isLineOrAreaChart: function(){
		var chartType=this.get('content').get('chartType');
		console.log(chartType);
		if(chartType=="8" || chartType=="11"){
			return true;
		}
		else{
			return false;
		}
	}.property('content.chartType'),

	isTimeSeriesChart: function(){
		var chartType=this.get('content').get('chartType');
		console.log(chartType);
		if(chartType=="8" || chartType=="11" || chartType=="12" || chartType=="9"){
			return true;
		}
		else{
			return false;
		}
	}.property('content.chartType'),



	/**
	  Downloads the chart as png image.

	  @method download
	  @param null
	  @return null 
	*/

	/**
	  Commits the height and width of chart on the server

	  @method resizeChart
	  @param {Integer} chartId
	  @return null 
	*/
	resizeChart: function(chart) {
		var c = this.get('content');
		var has_legend = c.get('hasLegend');
		var legend_width = has_legend ? 100 : 10;
		var width  = chart.width - legend_width - 35;
		var height = chart.height - 78;
		c.set('width', width);
		c.set('height', height);
		c.get('transaction').commit({'chart': chart});
	},
 

	/**
	  Updates chart attributes, title and subtitle currently, on the server
	*/
	  	popoverId: function() {
	  		return 'margins-icon-' + this.get('id');
	  	}.property(''),


	  	dataSourcePopoverId: function() {
	  		return 'data-source-popover' + this.get('id');
	  	}.property(''),

	  	configObject: function(){
			return JSON.parse(this.get('configs'));
		}.property(''),

	
		drillId: function() {
		  		return 'btn-' + this.get('id');
		}.property(''),

	  	titleToggle: function() {
	    	if (this.get('modalEnabled') == true)
	    	{
	  		return 'On Click Drill Through Enabled';
		  	}
		  	else
		  	{
		  	return 'On Click Drill Through Disabled';
		  	}
	  	}.property(''),
  	
	/**
	  Updates chart's margins on the server

	  @method updateMargins
	  @param {Object} data javascript object
	  @return null 
	*/
  	updateMargins: function() {
  		var obj = this;
		var c = this.get('content');
		var axesConfigsObj=c.get('axesConfigsObj');
		if(axesConfigsObj){
			if(axesConfigsObj.yDomainMinValue && axesConfigsObj.yDomainMinValue!="0"){
				c.set("axesConfigsObj.yDomainMinValue",obj.formatDomainValue(axesConfigsObj.yDomainMinValue));	
			}
			if(axesConfigsObj.yDomainMaxValue && axesConfigsObj.yDomainMaxValue!="0"){
				c.set("axesConfigsObj.yDomainMaxValue",obj.formatDomainValue(axesConfigsObj.yDomainMaxValue));	
			}
			if(axesConfigsObj.xDomainMinValue && axesConfigsObj.xDomainMinValue!="0"){
				c.set("axesConfigsObj.xDomainMinValue",obj.formatDomainValue(axesConfigsObj.xDomainMinValue));	
			}
			if(axesConfigsObj.xDomainMaxValue && axesConfigsObj.xDomainMaxValue!="0"){
				c.set("axesConfigsObj.xDomainMaxValue",obj.formatDomainValue(axesConfigsObj.xDomainMaxValue));	
			}
			if(axesConfigsObj.rightYDomainMinValue && axesConfigsObj.rightYDomainMinValue!="0"){
				c.set("axesConfigsObj.rightYDomainMinValue",obj.formatDomainValue(axesConfigsObj.rightYDomainMinValue));	
			}
			if(axesConfigsObj.rightYDomainMaxValue && axesConfigsObj.rightYDomainMaxValue!="0"){
				c.set("axesConfigsObj.rightYDomainMaxValue",obj.formatDomainValue(axesConfigsObj.rightYDomainMaxValue));	
			}		
		}			
		var data=JSON.stringify(axesConfigsObj);
		c.set("axesConfigs",data);
		c.on('didUpdate', function() {
			c.draw();
		})
		c.get('store').commit();			
	},

	formatDomainValue: function(val){
		val=val.toString();
		if(val.indexOf("k")!=-1){
			val.replace("k","");
			return toFloat(val)*1000;
		}
		else if(val.indexOf("L")!=-1){
			val.replace("L","");
			return toFloat(val)*100000;
		}
		else if(val.indexOf("Cr")!=-1){
			val.replace("Cr","");
			return toFloat(val)*10000000;
		}
		else if(val.indexOf("M")!=-1){
			val.replace("M","");
			return toFloat(val)*1000000;
		}
		else if(val.indexOf("B")!=-1){
			val.replace("B","");
			return toFloat(val)*1000000000;
		}
		else{
			return toFloat(val);
		}
	},


    updateTypes: function(data) {
        var obj = this;
        var c = this.get('content');
        var has_legend = c.get('hasLegend');
        c.set('chartType', data.chartType);
        c.on('didUpdate', function() {
        	c.draw();
        })
        c.get('store').commit();              	
    },

	/**
	  Updates chart's data source on the server

	  @method updateDataSource
	  @param {Object} data javascript object
	  @return null 
	*/
  	updateDataSource: function() {
  		var obj = this;
		var c = this.get('content');
		c.on('didUpdate', function() {
			c.draw();
		});
		c.get('transaction').commit();			
		
	},

	/**
	  Updates chart's configs source on the server

	  @method updateChartConfigs
	  @param {Object} data javascript object
	  @return null 
	*/
	updateChartConfigs: function(data) {
		var obj = this;
		var c = this.get('content');
		var cds = c.get('chartsDataSources').objectAt(0);
		if($.isEmptyObject(data) == true) {
			c.set('configs', null);
		} else {
			c.set('configs', JSON.stringify(data));
			if(data['sort_by_key'] !== undefined){
				c.set('sortByKey', 'true');
			} else {
				c.set('sortByKey', 'false');
			}
			if(data['Count']){
				this.updateCount(data['Count']);
			}
		}

		c.on('didUpdate', function() {
			c.draw();
		})
		c.get('store').commit();
	},

	updateCount: function(count){
		var obj = this;
		var chart = this.get('content');
		var cds = chart.get('chartsDataSources').objectAt(0);
		cds.set('count',count);
		cds.get('store').commit();
	},


    editType: function() {
    	var obj=this;
		var type    = this.get('content').get('chartType');
		var no_of_measures = this.get('content').get('measures').get('content').length;
		var no_of_dimensions = this.get('content').get('dimensions').get('content').length;
		var depth = this.get('content').get('chartsDataSources').objectAt(0).get('depth');
		var chartArray = new Array();
     	
     	if(type){
			switch(type) {
				case "1": // Bar Chart
				    if((no_of_measures == 1) && (depth == null) ){
						chartArray = ['2','8','11','17','18'];
				    	return chartArray;
				    	break;
				    }else if((no_of_measures == 1) && (depth.length > 0)){
                        chartArray = ['9'];
				    	return chartArray;
				    	break;
				    }else{
				    	chartArray = ['6'];
				    	return chartArray;
				    	break;
				    }
				case "2": // Pie Chart
					chartArray = ['1','8','11','17','18'];
					return chartArray;
					break;
			    case "3": // Collapsable tree
					chartArray = ['0'];
					return chartArray;
					break;
				case "0": // Collapsable table
					chartArray = ['3'];
					return chartArray;
					break;
				case "4": // Geo chart
					chartArray = ['1'];
					return chartArray;
					break;
				case "6": // combo Chart
					chartArray = ['1'];
					return chartArray;
					break;
				case "8": // Line Chart
					chartArray = ['1','11','2'];
					return chartArray;
					break;
				case "9": // MutiLine Chart
					chartArray = ['1'];
					return chartArray;
					break;
				case "11": // AreaChart
					chartArray = ['1','8','2'];
					return chartArray;
					break;
				case "13": // Scatter plot
					var measure_format = obj.get('content').get('measures').objectAt(0).get('formatAs');
					if(no_of_measures == 1 && measure_format!=undefined && measure_format.trim().length>0){
						if(depth == null){
							chartArray = ['1','8','11','2'];
						}else if(depth.length > 0){
							chartArray = ['1','9','12'];
						}
						return chartArray;
					}
					break;
				case "17": // Donut Chart
					chartArray = ['1','2','8','11','18'];
					return chartArray;
					break;		
				case "18": // Funnel Chart
					chartArray = ['1','2','8','11','17'];
					return chartArray;
					break;
				case "20": //Gauge Chart
					chartArray = ['15'];
					return chartArray;
					break;
				case "15"://SingleValue Chart
					if(no_of_dimensions == 0)
						chartArray = ['20'];
						return chartArray;
					break;								
			    default: 		
					chartArray = [];
					return chartArray;
			}
		}
    }.property('chartType'),

	getSortByKey: function() {
		var c = this.get('content');
       	if( c.get('sortByKey') == 'true' ){
       		return true;
       	} else {
       		return false;
       	}
	}.property('sortByKey'),

	dimensionsGroupArr: function(){
		var obj = this;
		if(!obj.get('isSetup')) {
			return [];
		}
		var arr = this.get('content').get('dimension_unique_values');
		obj.set('dimensionsArray', arr);
    }.observes('isSetup', 'dimension_unique_values'),

    fieldsArr: function() {
		var cds = this.get('content').get('chartsDataSources').objectAt(0);
		if(!cds) {
			return [];
		}
		var dimensions =  cds.get('dataSource').get('fieldsArr').sort();
        return [''].concat(dimensions);
    }.property('isSetup'),

    fieldType: function(field_name) {
		var cds = this.get('content').get('chartsDataSources').objectAt(0);
		if(!cds) {
			return false;
		}
		var field_type =  cds.get('dataSource').getDataType(field_name);
        return field_type;    	
    },

    getDimensionUniqueVals: function(dimension_name, callback, viewObj, format_as) {
    	if(!this.get('isSetup')) {
    		return [];
    	}

    	var arr = this.get('content').get('dimension_unique_values');
		var cds = this.get('content').get('chartsDataSources').objectAt(0);
		if(!cds) {
			return [];
		}
		if(!dimension_name) {
			return [];
		}
		if(format_as=="Hours" || format_as == "Day" || format_as == "Week"){
			format_as=null;
		}
        var arr =  cds.getUniqueKeys(dimension_name, null, function(data) {
          	if(callback){
          	  	callback(data, viewObj) ;
           	}                 
        });
        return arr;
    },

    set_filters: function(data) {
    	var obj = this;
    	var chart_id = obj.get('id');
    	
    	var cfilter = Cibi.ChartFilter.createRecord(data);
    	cfilter.on('didCreate', function(filter) {
    		var dashboard = obj.get('dashboard');
    		if(dashboard) {
    			dashboard.drawAll();
    		}
    	});
    	cfilter.set('chart', obj.get('content'));
		cfilter.get('transaction').commit();

    },

    selectedFieldsForDrillThrough: function(){
    	var selectedfields=this.get("selectedFields") || {};
    }.observes('selectedFields.@each'),

    isPivotTable: function(){
    	if(this.get('content').get('chartType')=="14")
    		return true;
    	else
    		return false;
    }.property('content.chartType'),

    isTableChart: function(){
    	if(this.get('content').get('chartType')=="14" || this.get('content').get('chartType')=="7" || this.get('content').get('chartType')=="0")
    		return true;
    	else
    		return false;
    }.property('content.chartType'),


    openConfigModal: function(obj){
    	var object=this;
    	$("#"+obj.get('containerId')).find("#modal-pivot-configs").modal();
    	$("#"+obj.get('containerId')).find("#modal-pivot-configs").find(".draggableElement").draggable({
			appendTo: $("#"+obj.get('containerId')).find("#modal-pivot-configs"),
      		helper: "clone",
      		revert: "invalid"
		});
		$("#"+obj.get('containerId')).find("#modal-pivot-configs").find(".droppableElement ul").droppable({
			drop: function( event, ui ) {
        		$( this ).find( ".placeholder" ).remove();        		
        		if(!(ui.draggable.parent().attr('id')==this.id)){
        			var configObj = JSON.parse((object.get('content').get('configs')) ? object.get('content').get('configs') : '{}');
        			var draggedLabel=ui.draggable.find("label").text();
        			if(ui.draggable.parent().attr('id')=="row_fields"){
        				draggedLabel=ui.draggable.find("label").text();
	        			configObj["hierarchy"]=_.without(configObj["hierarchy"], draggedLabel);
	        		}
	        		else if(ui.draggable.parent().attr('id')=="column_fields"){
	        			draggedLabel=ui.draggable.find("label").text();
	        			configObj["column_fields"]=_.without(configObj["column_fields"], draggedLabel);
	        		}
	        		else if(ui.draggable.parent().attr('id')=="measure_fields"){
	        			var text=ui.draggable.find("select").val();
	        			draggedLabel=text.split("(")[1].replace(")","");
	        			var m=_.find(configObj["measure_fields"],function(m){
							return ((m.format+"("+m.field+")")==text);
						});
	        			configObj["measure_fields"]=_.without(configObj["measure_fields"], m);
	        		}  
	        		if(this.id=="row_fields"){
	        			if(!configObj["hierarchy"]){
	        				configObj["hierarchy"]=[];
	        			}
	        			configObj["hierarchy"].push(draggedLabel);
	        		}
	        		else if(this.id=="column_fields"){
	        			if(!configObj["column_fields"]){
	        				configObj["column_fields"]=[];
	        			}
	        			configObj["column_fields"].push(draggedLabel);
	        		}
	        		else if(this.id=="measure_fields"){
	        			var measure={};
	        			measure["field"]=draggedLabel;
	        			measure["format"]="Sum";
	        			if(!configObj["measure_fields"]){
	        				configObj["measure_fields"]=[];
	        			}
	        			configObj["measure_fields"].push(measure);
	        		}	        		      		
	        		object.get('content').set('configs', JSON.stringify(configObj));
        		}        		
      		}
      	}).sortable({
	      revert: true,
	      placeholder: "ui-state-highlight"
	    });
    },
    
	singleValueChart: function(){
		return this.get('chartType') == "15"
	}.property(''),

	showStatisticalToolbox: function() {
		return this.get('chartType') == '1' || this.get('chartType') == '8' || this.get('chartType') == '11';
	}.property('chartType'),


	changeFormatAs: function(){
		var obj = this;
		var dimensions = obj.get('content').get('dimensions');
		var dim1 =dimensions.objectAt(0);
		var field_name = dim1.get('fieldName');
		if($(event.target).text() == 'Month Year'){
			dim1.set('formatAs','Month Year');
			dim1.set('displayName','Month Year Of '+field_name);
		}else if($(event.target).text() == 'Day'){
			dim1.set('formatAs','Day');
			dim1.set('displayName','Day Of '+field_name);
		}else if($(event.target).text() == 'Week'){
			dim1.set('formatAs','Week');
			dim1.set('displayName','Week Of '+field_name);
		}else if($(event.target).text() == 'Hours'){
			dim1.set('formatAs','Hours');
			dim1.set('displayName','Hours Of '+field_name);
		}else if($(event.target).text() == 'Date'){
			dim1.set('formatAs','Date');
			dim1.set('displayName','Date Of '+field_name);
		}else if($(event.target).text() == 'Year'){
			dim1.set('formatAs','Year');
			dim1.set('displayName','Year Of '+field_name);
		}else if($(event.target).text() == 'Month'){
			dim1.set('formatAs','Month');
			dim1.set('displayName','Month Of '+field_name);
		}else if($(event.target).text() == 'Quarter'){
			dim1.set('formatAs','Quarter');
			dim1.set('displayName','Quarter Of '+field_name);
		}
		//here we use .one as didUpdate was binding event multiple times 
		dim1.one('didUpdate', function() {
			var dashboard = obj.get('dashboard');
			dashboard.drawAll();
		});
		dim1.get('store').commit();	
	},

	convertToFullScreen: function(){
		var obj = this;
		var ch = obj.get('content');
		ch.set('isFullScreen',true);
		var title = obj.get('title');
		var chart= $("#chart-"+this.content.id);
		var legends = $('#chart-legend-'+this.content.id);
		var div = document.createElement('div');
		div.setAttribute('id','fullScreen-chart-'+this.content.id);
		div.setAttribute('style','position:absolute;left:0;top:0;z-index:99999;width:100%;height:110%;background-color:white');
		if(title) {
			$(div).append("<div id='chart-title' style='color:#2093cc;font-family:20px Roboto-Light;padding-bottom:5px;'>"+title+"</div>");
				// if(this.get('subtitle')){
				// 	$(div).find('#chart-title').append('<img src="/assets/Toolbaricon_vertical_bar.png" style="height:15px;"/>');
			 //    	$(div).find('#chart-title').append("<div style='color:#7c7c7c;font-family:16px Roboto-Light;padding-bottom:5px;'>"+this.get('subtitle')+"</div>");
				// }
		}else{
			$(div).append('<div id="chart-title" style="color:#2093cc;font-family:20px Roboto-Light;padding-bottom:5px;"><h4 class="muted" style="margin-left:15px; display:inline;">Title</h4></div>');
			$(div).find('#chart-title').append('<img src="/assets/Toolbaricon_vertical_bar.png" style="height:15px;"/>')
			// $(div).find('#chart-title').append('<h6 class="muted" style="display:inline;">Subtitle</h6>')
		}
		if(obj.get('hasLegend')){
			chart.height('80%');
			chart.width('100%');
		}else{
			chart.height('100%');
			chart.width('100%');
		}
		var svg = $(chart).find('svg');
		svg.attr('width','100%')
		   .attr('height','100%');
		if(obj.get('hasLegend')){
			$(svg).each(function (){ $(this)[0].setAttribute('viewBox', '-50 -10 800 200') });
		}else{
			$(svg).each(function (){ $(this)[0].setAttribute('viewBox', '-50 10 800 200') });
		}
		$(div).find('#chart-title').append('<div class="pull-right"><a id="exit-fullScreen" title="Exit Fullscreen"><i class ="icon-resize-small"></i></a></div>');
		$(div).append(chart);
		$(div).append(legends);
		$(div).find('#chart-legend-'+this.content.id).find('#chart-legend').css({'font-size':'20px','max-width':'100%'});
		$('body').append(div);
		$('#exit-fullScreen').on("click",obj, function(p){
			return function() {
				var chart = p.get('content');
				var dashboard = chart.get('dashboard');
				var orgdiv = $('#chart-container-'+ p.content.id).find('#popUpContainer');
				var c = $(div).find('#chart-' + p.content.id);
				var legend = $(div).find('#chart-legend-'+p.content.id);
				var svg = $(c).find('svg');
					$(svg).each(function (){ $(this)[0].removeAttribute('viewBox') });
				$(orgdiv).append(c);
				$(orgdiv).append(legend);
				$(div).remove();
				chart.set('isFullScreen',false);
				dashboard.drawAll();
			};
		}(obj));
	},
});


