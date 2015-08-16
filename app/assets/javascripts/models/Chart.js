/**
@class Cibi.Chart
*/

/**
  `Cibi.Chart` is the `Chart` model

  A chart has following attributes: 

  `title, subtitle, chartType, configs, cssClassName, width, height, marginTop, marginLeft, marginRight, marginBottom, secondaryDimension, modalEnabled, modalTitle, chartsDataSourcesStr`

  In addition, a chart has following relationships:

  belongs_to dashboard, 

  has_many comments, chartsDataSources
  
  @class Cibi.Chart
*/
Cibi.Chart = DS.Model.extend({
	title: DS.attr('string'),
	subtitle: DS.attr('string'),
	description: DS.attr('string'),
	chartType: DS.attr('string'),
	configs: DS.attr('string'),
	axesConfigs: DS.attr('string'),
	cssClassName: DS.attr('string'),
    // width: DS.attr('number'),
    // height: DS.attr('number'),
    marginTop: DS.attr('number'),
    marginLeft: DS.attr('number'),
    marginRight: DS.attr('number'),
    marginBottom: DS.attr('number'),
    secondaryDimension: DS.attr('string'),
    modalEnabled: DS.attr('boolean'),
    modalTitle: DS.attr('string'),
    chartsDataSourcesStr: DS.attr('string'),
    sortByKey: DS.attr('string'),
    descOrder: DS.attr('boolean'),
    orientationType: DS.attr('number'),
    drillThroughFields: DS.attr('string'),
    excludedRows: DS.attr('string'),
    chartDimensionsStr: DS.attr('string'),
    chartMeasuresStr: DS.attr('string'),
    rows: DS.attr('number'),
    columns: DS.attr('number'),
    displayRank: DS.attr('number'),
    createdAt: DS.attr('date'),
    updatedAt: DS.attr('date'),
    updatedBy: DS.attr('string'),
    isolated:DS.attr('boolean'),
    
	dashboard: DS.belongsTo('Cibi.Dashboard'),
	highlightRule: DS.belongsTo('Cibi.HighlightRule'),
	dimensions: DS.hasMany('Cibi.Dimension'),
	measures: DS.hasMany('Cibi.Measure'),
	comments: DS.hasMany('Cibi.Comment'),
	chartsDataSources: DS.hasMany('Cibi.ChartsDataSource'),
	chartFilters: DS.hasMany('Cibi.ChartFilter'),
	dataSources: DS.hasMany('Cibi.DataSource'),
	accountTemplate: DS.belongsTo('Cibi.AccountTemplate'),

	/**
		This method is used to get the height for chart according to screen size.

		@method height
	*/

	filteredChartFilters: function(){
		var chart_filters = this.get('chartFilters');
		if(chart_filters && chart_filters.get('length') > 0){
			var chartFilts = []
			for(i = 0 ; i < chart_filters.get('length'); i++){
				var chf = chart_filters.objectAt(i);
				if(chf.get('isLoaded') && (chf.get('isGlobal') || chf.get('user') == Cibi.Auth.currentUser)){
					chartFilts.push(chf);
				}
			}
			return chartFilts;
		}else{
			return [];
		}
	}.property('chartFilters.@each.isLoaded'),

	height: function() {
		var chart = this;
		var dashboard=chart.get('dashboard');
		return dashboard.getChartHeight(dashboard.get('rows'), chart.get('rows'), chart.get('hasLegend'),chart.get('hasTimeToggle'));
		// var tH=$(window).height();
		// console.log(tH);
		// var nR=dashboard.get('rows');
		// var dC=10;
		// var blockH=(tH-(nR-1)*dC)/nR;
		// var top_space = 96;
		// var legend_height = this.get('hasLegend') ? 0 : 51;
		// var legend_height_adj=50*(chart.get('rows')-1);
		// return (blockH*chart.get('rows')) + legend_height + legend_height_adj - top_space + ((chart.get('rows')-1)*dC);

	}.property('hasLegend','dashboard.rows','dashboard.columns'),

	columnLimit: function(){
		var chart = this;
		var dashboard=chart.get('dashboard');
		if(dashboard){
			return dashboard.get('columns');			
		}
	}.property('dashboard.columns'),

	rowLimit: function(){
		var chart = this;
		var dashboard=chart.get('dashboard');
		if(dashboard){
			return dashboard.get('rows');
		}
	}.property('dashboard.rows'),

	/**
		This method is used to get the width for chart according to screen size.

		@method width
	*/
	width: function() {
		var chart = this;
		var dashboard=chart.get('dashboard');
		return dashboard.getChartWidth(dashboard.get('columns'), chart.get('columns'));
		// var legend_width = this.get('hasLegend') ? 100 : 0;
		// console.log(dashboard.get('totalWidth'));
		// var tW=dashboard.get('totalWidth')-30;
		// var nC=dashboard.get('columns');
		// var dC=10;
		// var blockW=(tW-(nC-1)*dC)/nC;
		// return ((blockW * chart.get('columns'))+((chart.get('columns')-1)*dC)-10);
	}.property('hasLegend','dashboard.rows','dashboard.columns'),

	ntitle: function() {
		var title = this.get('title');
		var width=this.get('width');
		var length=(1/20)*width;
		var title1=title.substring(0, length);
		if(title != title1){ 
			return title1+"...";  
		}else{
			return title1;
		}
	}.property('title', 'width','title'),	

	nsubtitle: function() {
		var title = this.get('subtitle');
		var width=this.get('width');
		var length=(1/20)*width;
		var title1=title.substring(0, length);
		if(title != title1){ 
			return title1+"...";  
		}else{
			return title1;
		}
	}.property('subtitle', 'width'),

	checkSetup: function() {
		var obj = this;
		if(this.get('isLoaded') && !(this.get('isSetup'))) {
			var chart_filters = this.get('filteredChartFilters'),
			cds = this.get('chartsDataSources'),
			chart_dimensions = this.get('dimensions'),
			chart_measures = this.get('measures'),			
			dashboard = this.get('dashboard');
			data_sources = this.get('dataSources');
			highlight_rule=this.get('highlightRule');

			isSetup = true;

			isSetup = dashboard && dashboard.get('isLoaded');

			if(!isSetup) {
				return;
			}

			if(highlight_rule){
				isSetup = highlight_rule.get('isLoaded');

				if(!isSetup) {
					return;
				}
			}

			cds.forEach(function(c) {
				isSetup = isSetup && c.get('isLoaded');
			});
			if(!isSetup) {
				return;
			}
			data_sources.forEach(function(c) {
				isSetup = isSetup && c.get('isLoaded');
			});
			if(!isSetup) {
				return;
			}			
			chart_dimensions.forEach(function(c) {
				isSetup = isSetup && c.get('isLoaded');
			});
			if(!isSetup) {
				return;
			}
			chart_measures.forEach(function(c) {
				isSetup = isSetup && c.get('isLoaded');
			});
			if(!isSetup) {
				return;
			}
			chart_filters.forEach(function(c) {
				isSetup = isSetup && c.get('isLoaded');
			});

			if(isSetup) {
				this.set('isSetup', isSetup);
				// if($("#"+this.get('containerId')).length > 0){
					obj.draw();
				// }				
			}			
		}
	}.observes('isLoaded', 'dashboard.isLoaded', 'highlightRule.isLoaded', 'chartsDataSources.@each.isLoaded', 'measures.@each.isLoaded', 'dimensions.@each.isLoaded','dataSources.@each.isLoaded', 'chartFilters.@each.isLoaded'),

// ============= TODO : DELETE THIS ================== //
	/**
		This method observes `isLoaded` property of the Ember model, and it is called automatically, 
		everytime this property changes its value.

		@method checkSetup
	*/
	// checkSetup: function() {
	// 	var obj = this;
	// 	if(this.get('isLoaded') && !(this.get('isSetup'))) {
	// 		var chart_filters = this.get('chartFilters');
	// 		var cds = this.get('chartsDataSources');
	// 		var chart_dimensions = this.get('dimensions');
	// 		var chart_measures = this.get('measures');
	// 		cds.forEach(function(c) {
	// 			c.checkSetup();
	// 		})
	// 		this.set('isSetup', false);
	// 	}
	// }.observes('isLoaded'),

	/**
		This method is called from `onSetup` method of `charts_data_source` model.
		It sets the isSetup flag to true on the current chart object.

		@method setupComplete
	*/
	// setupComplete: function() {
	// 	var obj = this;
	// 	if(this.get('isLoaded')) {
	// 		var isSetup = true;
	// 		var cds = this.get('chartsDataSources');
	// 		cds.forEach(function(c) {
	// 			isSetup = isSetup && c.get('isSetup');
	// 		});
	// 		var chart_filters = this.get('chartFilters');
	// 		chart_filters.forEach(function(cf) {
	// 			isSetup = isSetup && cf.get('isLoaded');
	// 		});
	// 		this.set('isSetup', isSetup);
	// 	}
	// },
	
	/**
		This method returns a configuration object. It contains all data required to create and draw the chart.


		@method configObj
		@return {Object} configObj
	*/
	configObj: function() {
		if(this.get('isSetup')) {
			var obj = this, config_str = this.get('configs');

			var configObj = null;
			if(config_str) {
				configObj = JSON.parse(config_str);	
			}
			
			configObj = configObj ? configObj : {};
			var dashboard = this.get('dashboard');
			var cds = this.get('chartsDataSources').objectAt(0);
			// if(cds) {
			// 	var dataSource = cds.get('dataSource');	
			// }
			
			configObj.element = this.get('elemId');
			configObj.dashboard = dashboard;
			configObj.chart 	= this;
			configObj.cds 		= this.get('chartsDataSources');
			// configObj.dataSource = dataSource;
			
			// configObj.count = cds.get('count') || 'Infinity';
			// configObj.fact = cds.get('fact');
			// configObj.factType = cds.get('factType');
			// configObj.dimensionName = cds.get('dimensionName');
			// configObj.dimension = cds.get('dimension');	
			// configObj.group = cds.get('group');	
			return configObj;
		} 
		return false;

	}.property('isSetup', 'configs'),

	axesConfigsObj:function(){
		// if(this.get('isSetup')) {
			var obj = this;
			var axesConfigsObj = (obj.get('axesConfigs')) ? JSON.parse(obj.get('axesConfigs')) : null;
			axesConfigsObj = axesConfigsObj ? axesConfigsObj : {};
			return axesConfigsObj;
		// }
	}.property('isSetup','axesConfigs'),

	hasAxes:function(){
		var chartType=this.get('chartType');
		if(chartType=="1" || chartType=="6" || chartType=="8" || chartType=="9" || chartType=="10" || chartType=="horizontal-bar" || chartType=="11" || chartType=="12" || chartType=="13")
		{
			return true;
		}
		else
		{
			return false;
		}
	}.property('chartType'),

	set_config_property: function(property, value) {
		var configObj = JSON.parse(this.get('configs')) || {};
		configObj[property] = value
		this.set('configs', JSON.stringify(configObj));
		this.get('transaction').commit();
	},

	chartDataTotalId: function(){
		return "chart-data-total-"+this.get('id');
	}.property('id'),

	elemId: function() {
		return "chart-" + this.get('id');
	}.property('id'),

	orientationRadioId: function(){
		return "orientationRadio-" + this.get('id');
	}.property('id'),

	legendId: function() {
		return "chart-legend-" + this.get('id');
	}.property('id'),

	containerId: function() {
		return "chart-container-" + this.get('id');
	}.property('id'),

	commentContainerId: function() {
		return "chart-comments-" + this.get('id');
	}.property('id'),

	className: function() {
		return "row resizable ui-box chart-container " + this.get('cssClassName');
	}.property('configObj'),

	chartObj: function() {
		var configObj = this.get('configObj');
		var chartType = this.get('chartType');
		if( configObj && chartType ) {
			switch(this.get('chartType')) {
				case "1": // Bar Chart
					return Cibi.BarChart.create(configObj);
					break;
				case "horizontal-bar":
					return Cibi.HorizontalBarChart.create(configObj);
					break;
				case "2": // Pie Chart
					return Cibi.PieChart.create(configObj);
					break;
				case "7": // Table
					return Cibi.Table.create(configObj);
					break;
				case "3": // C Tree
					return Cibi.CTree.create(configObj);
					break;
				case "0": // C Table
					return Cibi.CTable.create(configObj);
					break;
				case "5": // Heat Map
					return Cibi.HeatMap.create(configObj);
					break;
				case "4": // Geo Map
					return Cibi.GeoMap.create(configObj);
					break;
				case "6":
					return Cibi.ComboChart.create(configObj);
					break;
				case "8":
					return Cibi.LineChart.create(configObj);
					break;
				case "9":
					return Cibi.MultilineChart.create(configObj);
					break;
				case "10":
					return Cibi.HorizontalBarChart.create(configObj);
					break;
				case "11":
					return Cibi.AreaChart.create(configObj);
					break;
				case "12":
					return Cibi.StackedAreaChart.create(configObj);
					break;
				case "13":
					return Cibi.ScatterPlot.create(configObj);
					break;
				case "14":
					return Cibi.PivotTableChart.create(configObj);
					break;
				case "15":
					return Cibi.SingleValueChart.create(configObj);
					break;	
				case "16":
					return Cibi.GeoMapIndia.create(configObj);
					break;
				case "17": // Donut Chart
					return Cibi.DonutChart.create(configObj);
					break;		
				case "18": // Funnel Chart
					return Cibi.FunnelChart.create(configObj);
					break;	
				case "19":
					return Cibi.GeoMapUSA.create(configObj);
					break;																						
				case "20": //Gauge Chart
					return Cibi.GaugeChart.create(configObj);
					break;																	
			}
		}
	}.property('isSetup', 'configObj', 'chartType', this),

	resetLegendFilter: function() {
		this.set('legendFilter', false);
		this.get('dashboard').drawAll()	
	},

	clearChart: function() {
		var elem = this.get('elemId');
		$("#" + elem).html("");
	},
	
	/**
		It checks if chart object is loaded and setup, and then calls `draw()` on the chart Object
		to draw the chart.

		It observes `height` and `width` property of chart, thus it is automatically called when these
		properties change. For ex. when chart is resized.


		@method draw
	*/
	draw: function() {
		var obj = this,
		dashboard = this.get('dashboard');

		this.set('errorMessage', null);

		if(!this.get('isSetup')) {
			return;
		}

		if(!dashboard || !dashboard.get('drawCharts')) {
			return;
		}

		var chartObj = this.get('chartObj');
		if(!chartObj) {
			return;
		}
		obj.set('noDimensions', false);

		var cds = this.get('chartsDataSources');		
      	if(!obj.get('noDimensions')) {
      		chartObj.draw();
      	}
		this.set('isSetup', true);
		dashboard.highlightFilters();
	},
	// }.observes('chartType','configs'),

	drawPreviewChart: function(chart_name) {
		var obj = this;

		var chartObj = this.get('chartObj');
		if(!chartObj) {
			return;
		}
      	chartObj.draw(true);

	}.observes(''),

	/**
		It attaches a tooltip to the chart element and is activated on mouse over event.


		@method chartElementOnMouseEnter
		@param {String} key
		@param {String} value
		@param {String} fact
		@param {String} factType
		@param {String} factUnit
	*/

	/* chartElementOnMouseEnter: function(d, otherData) {
		var obj=this;
		var cds=obj.get('chartsDataSources').objectAt(0);
		var fact = otherData.fact || cds.get('factDisplay') || cds.get('fact');
		var factType = otherData.factType || cds.get('factType');
        var factUnit= otherData.factUnit || cds.get('factUnit');
        var i=otherData.index;
        var details=otherData.details;
        var total_val=otherData.total_val;
        var key=d.key;
        var value;
        if(d.value || d.value==0){
        	value=d.value;
        }else if(d[fact] || d[fact] == 0){
        	value=d[fact];
        }else if(d.y || d.y==0){
        	value = d.y
        }else{
        	value=null;
        }
        var depth = displayTick(d['zkey']);

        var highlightRule=obj.get('highlightRule');
        var statsData;
        if(obj.statsData){
          statsData=obj.statsData;
        }
        var statsVal;
        if(highlightRule && highlightRule.get('enable_highlight')) {
          if(key==JSON.parse(highlightRule.get('configs')).control_field){
            statsVal=null;
          }else{
            statsVal=statsData[i]["pValue"];
          }
        }
        var semVal=null;
        if(highlightRule && highlightRule.get('enable_highlight') && highlightRule.get('enable_sem')) {
          semVal=statsData[i]["sem"];
        }
		
		var dimensionFormat=cds.get('dimensionFormatAs');
		var div = d3.select("#chart-tooltip");
	    div.transition()
	    .duration(500)
	    .style("opacity", 0.9);
	    var val = "";
	    var html = "<table style='text-align:left;'>";
	    if(key){
	    	html += "<tr><td>";
		    html += obj.get('chartsDataSources').objectAt(0).get('dimensionDisplay');
		    html += "</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
		    html += obj.get('formatDate') ? obj.get('formatDate')(obj.get('parseDate')(key)) : key;
		    html += "</td></tr>";
	    }
	    if(depth){
	        var dimension=obj.get('dimensions').objectAt(1);
	        var formats=obj.getDateFormatFunctions(dimension);
	        var formatDate = formats["formatDate"];
	        var parseDate = formats["parseDate"];
	    	html += "<tr><td>";
		    html += obj.get('chartsDataSources').objectAt(0).get('depthDisplay');
		    html += "</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
		    html += formatDate ? formatDate(parseDate(depth)) : depth;
		    html += "</td></tr>";	
	    }

	    // html += key; 

	    if(value || value==0) {
		    var displayFormat=obj.get('axesConfigsObj').yAxisDisplayUnit;
		    var val = CommaFormatted(value, displayFormat);
		    var percent="";
		    if (total_val) {
		    	percent=d3.format('.2%')(value/total_val);	
		    }		   
		    if (factUnit) {
		    	if(factUnit['prefix'] == "USD") {
		    		val = " $ " + val;
		    	} else if(factUnit['prefix'] == "Rs") {
					val = " ₹ "	+ val;
		    	}

		    	if(factUnit['suffix']){
					val = val + " " + factUnit["suffix"] + " ";
		    	}	
		    }

		    if(fact) {
		    	html += "<tr><td>";
			    html += fact;
			    html += "</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
			    html += val;
			    html += "</td></tr>";	
		    	// html += "<br/> ( " + fact + " : " + val + " )";
			    if(percent) {
			    	html += "<tr><td>&nbsp;</td><td>";
			    	html += "&nbsp;";
			    	html += "</td><td>";
				    html += percent;			    
				    html += "</td></tr>";
			    	// html += "<br />" + percent;
			    } 			    
			}
	    }

	    if(statsVal || statsVal==0){
	    	html+="<tr><td>";
	    	html+=obj.get('highlightRule').get('comparison_function');
	    	html+="</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
	    	html+=d3.format('.5f')(statsVal);
	    	html+="</td></tr>";
	    }

	    if(semVal || semVal==0){
	    	html+="<tr><td>";
	    	html+="Standard error of mean";
	    	html+="</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
	    	html+=d3.format('.5f')(semVal);
	    	html+="</td></tr>";
	    }

	    if(details){
	    	html += "<tr><td colspan='2'>";
		    html += details;
		    html += "</td></tr>";
	    }
	    html += "</table>";
	    
	    div.html(html);

	    var ds=$("#main-tab");
		var left=ds.position().left;
		var right=left+(ds.width());
		var pageX=d3.event.pageX;
		var div_width=parseInt(div.style("width").replace("px",""));
		if((pageX + div_width) > right){
			pageX=pageX - div_width;
		}   

		
	    div.style("left", (pageX + "px"))
	     .style("top", (d3.event.pageY - 28) + "px");
	},*/

	
	/**
		It handles mouse exit event on chart elements.


		@method chartElementOnMouseExit
	*/
	chartElementOnMouseExit: function() {
		var div = d3.select("#chart-tooltip");
		div.html("");
		div.transition()
        .duration(500)
        .style("opacity", 0);		
	},

	/**
		It handles mouse click event on each chart element.

		If `modalEnabled` flag is set in the chart, it calls `createModal` method to generate a modal and display it.
		
		Else, it simply applies Filter on each ChartsDataSource.

		@method chartElementOnClick
		@param {String} key
		@param {String} element_id
		@param {String} dimensionName
		@param {Object} rawData
	*/

	chartElementOnClick: function(element_id, filter, d, otherData, tip, svg){
		var obj = this;
		var dashboard = obj.get('dashboard');
		var currentFilter=_.clone(filter);
		if(obj.get('isFullScreen') == true){
			return;
		}else{
			if(obj.get('modalEnabled')){
				obj.applyChartElementOnClick(element_id, currentFilter, "=");
				var cds = obj.get('chartsDataSources').objectAt(0);
				dashboard.set('filterOn', true);
				// obj.set('chartFilter', ((filter.length>1) ? filter[0].value : filter.value)); 			
				var drill_through_fields=obj.get('drillThroughFields');
				var filters = obj.getFilters();
				var pagination = 10;					// change to set number of records per page.
				var rawData = cds.rawData(filters, pagination, 0, drill_through_fields);
				var count = rawData.count;
				rawData = rawData.results;	      
				obj.createModal(rawData, ((filter.length>1) ? filter[0].value : filter.value), null, count, pagination, filter);
			}else{
				obj.set("notToHideTip","true");
			    var id = '[id=""'+ element_id +'""]';
		    var html = "<div style='text-align:right;margin-top:-12px; margin-right: -12px; height:15px;margin-bottom: 5px;'>"
		    html += "<span style='vertical-align:top;'><a class='cancel' style='font-size: large; margin-right: 4px;'>&times;</a></span>"
			html += "</div>"
		    html += obj.getChartElementTipData(d, otherData, tip, svg);
		    
		    var configs = JSON.parse(obj.get('configs')) || {};
	    	var dashboardId = configs["detailsDashboardId"];
	    	if(dashboardId){
	    		html += "<div class='row'>";
			    html += "<div class='span' style='width:33%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='include-"+element_id+"'>Include</a>";
			    html += "</div>";
			    html += "<div class='span' style='width:33%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='exclude-"+element_id+"'>Exclude</a>";
			    html += "</div>";
			    html += "<div class='span' style='width:33%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='details-"+element_id+"'>Details</a>";
			    html += "</div>";
			}else{
				html += "<div class='row'>";
			    html += "<div class='span' style='width:50%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='include-"+element_id+"'>Include</a>";
			    html += "</div>";
			    html += "<div class='span' style='width:50%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='exclude-"+element_id+"'>Exclude</a>";
			    html += "</div>";
			}
		    html += "</div>";
		    tip.html(html);
		    tip.show();
			    $('[id="include-'+ element_id+'"]').on("click",function(){
			    	obj.applyChartElementOnClick(element_id, currentFilter, "IN");
			    	dashboard.set('filterOn', true);
	        		var filterKeys = dashboard.get('filterKeys') || [];
	        		filterKeys.push(element_id);
					dashboard.set('filterKeys', filterKeys);
					dashboard.drawAll(obj.get('id'));
					dashboard.highlightFilters();
			    	obj.set("notToHideTip", false);
			    	tip.html("");
			    	tip.hide();
			    }); 
			    $('[id="exclude-'+ element_id+'"]').on("click",function(){
			    	obj.applyChartElementOnClick(element_id, currentFilter, "NOT IN");
			    	dashboard.set('filterOn', true);
	        		var filterKeys = dashboard.get('filterKeys') || [];
	        		filterKeys.push(element_id);
					dashboard.set('filterKeys', filterKeys);
					dashboard.drawAll(obj.get('id'));
					dashboard.highlightFilters();
			    	obj.set("notToHideTip", false);
			    	tip.html("");
			    	tip.hide();
			    }); 
			    $('[id="details-'+ element_id+'"]').on("click",function(){
			    	obj.linkToDashboard(element_id, currentFilter, "IN");
			    	obj.set("notToHideTip", false);
			    	tip.html("");
			    	tip.hide();
			    }); 
			    $(".d3-tip").on("click", "a.cancel", function(){
			    	obj.set("notToHideTip", false);
			    	tip.html("");
			    	tip.hide();
			    });
			}
		}		
	},

    applyChartElementOnClick: function(element_id, currentFilter, operator) {
      	var obj = this;
      	var dashboard = obj.get('dashboard');
      	var filter = _.clone(currentFilter);
      	var formatDate=obj.get('formatDate');
      	var parseDate=obj.get('parseDate');
      	var chartFilterObj = dashboard.get('chartFilterObj');
      	var id = '[id="'+ element_id +'"]';

      		// filter.display_str = filter.value ? filter.value.substr(0,15) + " .." : "";
      		if(filter instanceof Array){
      			filter[0].display_str=(formatDate) ? formatDate(parseDate(filter[0].value)) : filter[0].value;
      			filter[1].display_str=filter[1].value;
      			_.each(filter, function(f){
      				f.display_str=(f.display_str && f.display_str.length>15) ? f.display_str.substr(0,15)+" .." : f.display_str;
      				f.chart_id=obj.get('id');
      				f.operator = operator;
      			});

      			if(chartFilterObj){

      				_.each(filter, function(f){
      					var sameDimensionFilter = _.find(chartFilterObj, function(cf){
      						if(cf.dimension == f.dimension && cf.operator == f.operator){
      							return cf;
      						}
      					});
      					if(sameDimensionFilter){
	      					if(sameDimensionFilter.value instanceof Array){
	      						sameDimensionFilter.value.push(f.value);
	      						// sameDimensionFilter.value = sameDimensionFilter.value.uniq();
	      					}else{
	      						var value=[];
	      						value.push(sameDimensionFilter.value);
	      						value.push(f.value);
	      						sameDimensionFilter.value = value;
	      					}
	      				}else{
	      					if(typeof f.value == "string"){
	      						var arr = [];
	      						arr.push(f.value);
	      						f.value = arr;
	      					}
	      					chartFilterObj.addObject(f);
	      				}
      				});
      				dashboard.set('chartFilterObj', chartFilterObj);
      				dashboard.notifyPropertyChange('chartFilterObj');
      			}else{
      				var chartFilterObj =[];
      				if(typeof filter[0].value == "string"){
  						var arr = [];
  						arr.push(filter[0].value);
  						filter[0].value = arr;
  					}
      				chartFilterObj.addObject(filter[0]);
      				if(typeof filter[1].value == "string"){
  						var arr = [];
  						arr.push(filter[1].value);
  						filter[1].value = arr;
  					}
      				chartFilterObj.addObject(filter[1]);
      				dashboard.set('chartFilterObj', chartFilterObj);
      				dashboard.notifyPropertyChange('chartFilterObj');
      			}

      		}
      		else {
      			filter.display_str=(formatDate) ? formatDate(parseDate(filter.value)) : filter.value;
      			filter.display_str=(filter.display_str.length>15) ? filter.display_str.substr(0,15)+" .." : filter.display_str;
      			filter.chart_id=obj.get('id');
      			filter.operator = operator;
      			if(chartFilterObj){
      				var sameDimensionFilter = _.find(chartFilterObj, function(cf){
  						if(cf.dimension == filter.dimension && cf.operator == filter.operator){
  							return cf;
  						}
  					});

  					if(sameDimensionFilter){
      					if(sameDimensionFilter.value && sameDimensionFilter.value instanceof Array){
	  						sameDimensionFilter.value.push(filter.value);
	  						// sameDimensionFilter.value = sameDimensionFilter.value.uniq();
	  					}else{
	  						var value=[];
	  						value.push(sameDimensionFilter.value);
	  						value.push(filter.value);
	  						sameDimensionFilter.value = value;
	  					}
      				}else{
      					if(typeof filter.value == "string"){
	  						var arr = [];
	  						arr.push(filter.value);
	  						filter.value = arr;
	  					}
      					chartFilterObj.addObject(filter);
      				}
      				
      				dashboard.set('chartFilterObj', chartFilterObj);
      				dashboard.notifyPropertyChange('chartFilterObj');
      			}else{
      				var chartFilterObj =[];
      				if(typeof filter.value == "string"){
  						var arr = [];
  						arr.push(filter.value);
  						filter.value = arr;
  					}
      				chartFilterObj.addObject(filter);
      				dashboard.set('chartFilterObj',chartFilterObj);
      				dashboard.notifyPropertyChange('chartFilterObj');
      			}

        	}        
    //     	if(obj.get('modalEnabled')) {
				// var cds = this.get('chartsDataSources').objectAt(0);
				// dashboard.set('filterOn', true);
				// // obj.set('chartFilter', ((filter.length>1) ? filter[0].value : filter.value)); 			
				// var drill_through_fields=obj.get('drillThroughFields');
				// var filters = obj.getFilters();
				// var pagination = 10;					// change to set number of records per page.
				// var rawData = cds.rawData(filters,pagination,0,drill_through_fields);
				// var count = rawData.count;
				// rawData = rawData.results;	      
				// obj.createModal(rawData, ((filter.length>1) ? filter[0].value : filter.value), null, count, pagination);
    //     	} else {
        		// this.clearHighlights();
    //     		dashboard.set('filterOn', true);
    //     		var filterKeys = dashboard.get('filterKeys') || [];
    //     		filterKeys.push(element_id);
				// dashboard.set('filterKeys', filterKeys);
				// // obj.set('chartFilter', ((filter.length>1) ? filter[0].value : filter.value)); 			
				// dashboard.drawAll(obj.get('id'));
				// dashboard.highlightFilters();
        	// }
    },

    linkToDashboard: function(element_id, currentFilter, operator){
    	var obj=this;
    	var configs = JSON.parse(obj.get('configs'));
    	var dashboardId = configs["detailsDashboardId"];
    	// var id = '[id=""'+ element_id +'""]';
    	// filter keys should contain only the value of element and not the selector syntax
    	var id = element_id; 
    	if(dashboardId){
	    	var dashboard = Cibi.Dashboard.find(dashboardId);
	    	var formatDate=obj.get('formatDate');
	      	var parseDate=obj.get('parseDate');
	    	var filter = _.clone(currentFilter);
			var chartFilterObj = dashboard.get('chartFilterObj');

			if(filter instanceof Array){
	  			filter[0].display_str=(formatDate) ? formatDate(parseDate(filter[0].value)) : filter[0].value;
	  			filter[1].display_str=filter[1].value;
	  			_.each(filter, function(f){
	  				f.display_str=(f.display_str && f.display_str.length>15) ? f.display_str.substr(0,15)+" .." : f.display_str;
	  				f.chart_id=obj.get('id');
	  				f.operator = operator;
	  			});

	  			if(chartFilterObj){

	  				_.each(filter, function(f){
	  					var sameDimensionFilter = _.find(chartFilterObj, function(cf){
	  						if(cf.dimension == f.dimension && cf.operator == f.operator){
	  							return cf;
	  						}
	  					});
	  					if(sameDimensionFilter){
	      					if(sameDimensionFilter.value instanceof Array){
	      						sameDimensionFilter.value.push(f.value);
	      					}else{
	      						var value=[];
	      						value.push(sameDimensionFilter.value);
	      						value.push(f.value);
	      						sameDimensionFilter.value = value;
	      					}
	      				}else{
	      					if(typeof f.value == "string"){
	      						var arr = [];
	      						arr.push(f.value);
	      						f.value = arr;
	      					}
	      					chartFilterObj.addObject(f);
	      				}
	  				});
	  			}else{
	  				chartFilterObj =[];
	  				if(typeof filter[0].value == "string"){
							var arr = [];
							arr.push(filter[0].value);
							filter[0].value = arr;
						}
	  				chartFilterObj.addObject(filter[0]);
	  				if(typeof filter[1].value == "string"){
							var arr = [];
							arr.push(filter[1].value);
							filter[1].value = arr;
						}
	  				chartFilterObj.addObject(filter[1]);
	  			}
	  		}else {
	  			filter.display_str=(formatDate) ? formatDate(parseDate(filter.value)) : filter.value;
	  			filter.display_str=(filter.display_str.length>15) ? filter.display_str.substr(0,15)+" .." : filter.display_str;
	  			filter.chart_id=obj.get('id');
	  			filter.operator = operator;
	  			if(chartFilterObj){
	  				var sameDimensionFilter = _.find(chartFilterObj, function(cf){
						if(cf.dimension == filter.dimension && cf.operator == filter.operator){
							return cf;
						}
					});

					if(sameDimensionFilter){
	  					if(sameDimensionFilter.value && sameDimensionFilter.value instanceof Array){
	  						sameDimensionFilter.value.push(filter.value);
	  					}else{
	  						var value=[];
	  						value.push(sameDimensionFilter.value);
	  						value.push(filter.value);
	  						sameDimensionFilter.value = value;
	  					}
	  				}else{
	  					if(typeof filter.value == "string"){
	  						var arr = [];
	  						arr.push(filter.value);
	  						filter.value = arr;
	  					}
	  					chartFilterObj.addObject(filter);
	  				}
	  			}else{
	  				chartFilterObj =[];
	  				if(typeof filter.value == "string"){
							var arr = [];
							arr.push(filter.value);
							filter.value = arr;
						}
	  				chartFilterObj.addObject(filter);
	  			}
	    	}
	    	dashboard.set('chartFilterObj',chartFilterObj);
	    	Cibi.Auth.set("linked_dashboard",dashboardId);
	    	Cibi.Auth.set("calling_dashboard",this.get("dashboard"));
	    	var filterKeys = dashboard.get('filterKeys') || [];
    		filterKeys.push(id);
			dashboard.set('filterKeys', filterKeys);
			dashboard.notifyPropertyChange('chartFilterObj');
			Cibi.Router.router.transitionTo("dashboard.charts",dashboard);
		}
    },

    createChartElementOnClickTooltip: function(key, value, element_id, pageX, pageY, value_display){
    	var obj = this;
		var dashboard = obj.get('dashboard');
		var dimensions = obj.get('dimensions');
		var dimension;
		dimensions.forEach(function(dim){
			if(dim.get('displayName') == key){
				dimension = dim;
			}
		});
		var tip = $("#chart-tooltip");
		var filter = {};
        filter.dimension = dimension.get('fieldName');
        filter.formatAs = dimension.get('formatAs');
        filter.value = value;
		var currentFilter=_.clone(filter);

		if(obj.get('modalEnabled')){
			obj.applyChartElementOnClick(element_id, currentFilter, "=");
			var cds = obj.get('chartsDataSources').objectAt(0);
			dashboard.set('filterOn', true);
			// obj.set('chartFilter', ((filter.length>1) ? filter[0].value : filter.value)); 			
			var drill_through_fields=obj.get('drillThroughFields');
			var filters = obj.getFilters();
			var pagination = 10;					// change to set number of records per page.
			var rawData = cds.rawData(filters, pagination, 0, drill_through_fields);
			var count = rawData.count;
			rawData = rawData.results;	      
			obj.createModal(rawData, ((filter.length>1) ? filter[0].value : filter.value), null, count, pagination, filter);
		}else{
		    var html = "<div style='text-align:right;margin-top:-12px; margin-right: -12px; height:15px;margin-bottom: 5px;'>"
		    html += "<span style='vertical-align:top;'><a class='cancel' style='font-size: large; margin-right: 4px;'>&times;</a></span>"
			html += "</div>"

			html += "<table style='text-align:left;'>";
	    	if(key){
		    	html += "<tr><td>"+ key +"</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>" +value_display+ "</td></tr>";
	    	}
	    	html += "</table>";
		    
		    var configs = JSON.parse(obj.get('configs')) || {};
	    	var dashboardId = configs["detailsDashboardId"];
	    	if(dashboardId){
	    		html += "<div class='row'>";
			    html += "<div class='span' style='width:33%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='include-"+element_id+"'>Include</a>";
			    html += "</div>";
			    html += "<div class='span' style='width:33%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='exclude-"+element_id+"'>Exclude</a>";
			    html += "</div>";
			    html += "<div class='span' style='width:33%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='details-"+element_id+"'>Details</a>";
			    html += "</div>";
			}else{
				html += "<div class='row'>";
			    html += "<div class='span' style='width:50%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='include-"+element_id+"'>Include</a>";
			    html += "</div>";
			    html += "<div class='span' style='width:50%; text-align: center; text-decoration: underline;'>";
			    html += "<a id='exclude-"+element_id+"'>Exclude</a>";
			    html += "</div>";
			}
		    html += "</div>";
		    tip.html(html);

		    var ds=$("#main-tab");
		    var left=ds.position().left;
		    var right=left+(ds.width());
		    var tip_width = tip.width();
		    if((pageX + tip_width) > right){
		    	pageX=pageX - tip_width;
		    }
		    tip.css("left", (pageX + "px"));
		    tip.css("top", (pageY - 28) + "px");
		    tip.css("pointer-events", "all");
		    tip.css("opacity","0.9");

		    $("#chart-tooltip").find('a[id="include-'+element_id+'"]').on("click",function(){
		    	obj.applyChartElementOnClick(element_id, currentFilter, "IN");
		    	dashboard.set('filterOn', true);
        		var filterKeys = dashboard.get('filterKeys') || [];
        		filterKeys.push(element_id);
				dashboard.set('filterKeys', filterKeys);
				dashboard.drawAll(obj.get('id'));
				dashboard.highlightFilters();
		    	tip.html("");
		    	tip.css("opacity", "0");
		    }); 
		    $("#chart-tooltip").find('a[id="exclude-'+element_id+'"]').on("click",function(){
		    	obj.applyChartElementOnClick(element_id, currentFilter, "NOT IN");
		    	dashboard.set('filterOn', true);
        		var filterKeys = dashboard.get('filterKeys') || [];
        		filterKeys.push(element_id);
				dashboard.set('filterKeys', filterKeys);
				dashboard.drawAll(obj.get('id'));
				dashboard.highlightFilters();
		    	tip.html("").css("opacity", "0");
		    });
		    $("#chart-tooltip").find('a[id="details-'+element_id+'"]').on("click",function(){
		    	obj.linkToDashboard(element_id, currentFilter, "IN");
		    	tip.html("").css("opacity", "0");
		    }); 
		    $("#chart-tooltip").on("click", "a.cancel", function(){
		    	tip.html("").css("opacity", "0");
		    });
		}
    },

	/**
		It creates a modal and returns its HTML code.
		@method createModal
		@param {Object} details
		@param {String} key
		@param {String} uniq_id
		@return {String} HTML string
	*/

    createModal: function(details, key, uniq_id, count, pagination, filter) {
    	var obj = this;
    	var dashboard = obj.get('dashboard');
    	var id = uniq_id ? pruneStr(uniq_id) : pruneStr(key);// .replace(/[\s,:(),\/]/g, "-");
    	var chart_id = obj.get('id');
    	var modal_id = "modal-" + chart_id + "-" + id;
    	var modal_elem = $("#" + modal_id);    	    	
    	var title = obj.get('modalTitle') || (key ? key + " : Details" :  "Details");
		
		var auth_token = Cibi.Auth.get('authToken');
		var filters = encodeURIComponent(JSON.stringify(this.get('dashboard').getAllFilters()));

		var total_pages = Math.ceil(count/pagination);
		
		var header_html="<div id='" + modal_id + "' class='modal large-modal hide fade'>";
		header_html += '<div class="modal-header">';
		header_html += '<div class="row">';
		header_html += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="margin-top: 0px;">×</button>';
		header_html += '<span class="pull-right muted"> &nbsp;&nbsp; | &nbsp;&nbsp; </span>';
		header_html += '<a id="sample_link" class="pull-right" href="/charts/' + this.get('id') + '/download_csv?auth_token=' + auth_token + '&filters=' + filters + '" target="_self">Download as Text file</a>';
		header_html += '<span class="pull-right muted"> &nbsp;&nbsp; | &nbsp;&nbsp; </span>';
		header_html += '<a id="underlying_data_link" class="pull-right">View underlying data</a>';
		header_html += '<h3 id="myModalLabel">' + title + '</h3>';
		header_html += '</div>';
		header_html += '<div class="row" style="margin-bottom: 10px;">';	

		if(dashboard.get('filterOn')){
			header_html+="<div class='span filterDiv' style='width:90%; border:none; text-align: start;'>"
			_.each(dashboard.get("chartFilterObj"),function(f){
				// header_html+="<div class='btn-group'>";
				header_html+="<div class='btn btn-mini btn-info button-label' style='margin-right: 5px; color:#fff; pointer-events: none;'>";
				header_html+=f.value;								
				header_html+="</div>";
				// var id=f.dimension+"-"+f.value;
				// id=id.replace(" ","")
				// header_html+="<a id='resetFilter"+id+"' class='btn btn-mini pull-right'>x</a>";				
				// header_html+="</div>";
			});
			header_html+="</div>";
		}
		header_html+="<div class='span optionsDiv' style='width:90%; display:none;'>"
		header_html+="<label class='pull-left radio' style='margin-right: 20px;'>";
		header_html+="<input type='radio' name='excludeOptionsRadios' value='hideExcludedRows'>Hide Excluded Rows";
  		header_html+="</label>";
  		header_html+="<label class='pull-left radio' style='margin-right: 20px;'>";
		header_html+="<input type='radio' name='excludeOptionsRadios' value='showOnlyExcludedRows'>Show Only Excluded Rows";
  		header_html+="</label>";
  		header_html+="<label class='pull-left radio' style='margin-right: 20px;'>";
		header_html+="<input type='radio' name='excludeOptionsRadios' value='showAll'>Show All";
  		header_html+="</label>";
  		header_html+="<div class='pull-right'><label class='rows-count' style='color: #aaa;'></label></div>";
  		header_html+="</div>";
		header_html+="<div class='span' style='width:10%;'>"
		header_html += '<button id="save_excluded_ids'+ chart_id +'" class="btn btn-info flat-button pull-right" type="button" style="background-color:#4093cd;">Save</button>';
		header_html += '</div>';
		header_html += '</div>';			
		header_html +='</div><!-- modal-header -->';
		header_html += '<div class="modal-body" id="dvData'+modal_id+'">';
		header_html += "</div><!-- modal-body -->";

		var html= obj.generateHtml(modal_id,auth_token,filters,details,total_pages);

		if(modal_elem.length > 1) {
			modal_elem.html(header_html);
		} else {
			$("#" + obj.get('elemId')).append(header_html);
			modal_elem = $("#" + modal_id);
		}

		$("#dvData"+modal_id).html(html);

		/* bind click events to pagination links. */
		// function for all page number links.
	    for(var j = 1; j <= total_pages; j++) {
		   $('#'+modal_id).find('#pagination'+modal_id).on('click','#pg_'+j, function(page) {
		      return function() {
		      	obj.gotoPage(page, count, modal_id, pagination);
		      };
		   }(j));	    	
		}

		// function for previous link.
		$('#'+modal_id).find('#pagination'+modal_id).on('click','#previous', function() {
  			var page = $('#current_page').val();
  			if(parseInt(page) > 1 ){
				obj.gotoPage(parseInt(page)-1, count, modal_id, pagination);
  			}	      	
	    });

	    // function for next link.
	    $('#'+modal_id).find('#pagination'+modal_id).on('click','#next', function() {
      		var page = $('#current_page').val();
  			if(parseInt(page) < total_pages ){
				obj.gotoPage(parseInt(page)+1, count, modal_id, pagination);
  			}	
	    });

	 //    _.each(obj.get("chartFilterObj"),function(f){
	 //    	var id=f.dimension+"-"+f.value;
		// 		id=id.replace(" ","");
		// 	$('#resetFilter'+id).on('click', function() {
		// 		obj.get('chartFilterObj').removeObject(f);
		// 		this.parentElement.remove();
		// 	});
		// });

		$('#'+modal_id).find('#underlying_data_link').on('click', function() {
			$("#"+modal_id).find('.modal-header').find('.filterDiv').hide();
			$("#"+modal_id).find('.modal-header').find('.optionsDiv').find('input[value="showAll"]:radio').prop("checked",true);
			$("#"+modal_id).find('.modal-header').find('.optionsDiv').show();
			// $("#"+modal_id).find('.modal-header').find('.optionsDiv').css("display","flex");

			obj.set('is_underlying_data',true);
			var f=encodeURIComponent(JSON.stringify([]));
			var href='/charts/' + obj.get('id') + '/download_csv?auth_token=' + (Cibi.Auth.get("authToken")) + '&filters='+f+'&is_underlying_data='+obj.get("is_underlying_data");
			$("#"+modal_id).find('.modal-header').find('#sample_link').attr('href',href);
			var new_rawData = obj.get('chartsDataSources').objectAt(0).rawData(null,pagination,0,null, obj.get('is_underlying_data'));
			var new_count = new_rawData.count;
			new_rawData = new_rawData.results;	
			total_pages=Math.ceil(new_count/pagination);
			var new_html= obj.generateHtml(modal_id,auth_token,filters,new_rawData,total_pages);

			$("#dvData"+modal_id).html(new_html);
			for(var j = 1; j <= total_pages; j++) {
			   $('#pagination'+modal_id).on('click','#pg_'+j, function(page) {
			      return function() {
			      	obj.gotoPage(page, count, modal_id, pagination);
			      };
			   }(j));	    	
			}

			// function for previous link.
			$('#pagination'+modal_id).on('click','#previous', function() {
	  			var page = $('#current_page').val();
	  			if(parseInt(page) > 1 ){
					obj.gotoPage(parseInt(page)-1, count, modal_id, pagination);
	  			}	      	
		    });

		    // function for next link.
		    $('#pagination'+modal_id).on('click','#next', function() {
	      		var page = $('#current_page').val();
	  			if(parseInt(page) < total_pages ){
					obj.gotoPage(parseInt(page)+1, count, modal_id, pagination);
	  			}	
		    });

		    $('input[name="exclude_id"]:checkbox').on('click', function(e) {
				var s=obj.get('excluded_ids');
		    	if(this.checked){
					s.push(this.id);
				}
				else{
					s.removeObject(this.id);
				}
		    });

		    $("#"+modal_id).find('.modal-header').find('.optionsDiv').find('input[name="excludeOptionsRadios"]:radio').on('click',function(e){
		    	// console.log(new_rawData);
		    	if(obj.get('excluded_ids').length>0 || this.value!="showOnlyExcludedRows"){
		    		var f, href, new_rawData, new_count, new_html;
		    		f=encodeURIComponent(JSON.stringify([]));
					href='/charts/' + obj.get('id') + '/download_csv?auth_token=' + (Cibi.Auth.get("authToken")) + '&filters='+f+'&is_underlying_data='+obj.get("is_underlying_data")+'&option_value='+this.value;
					$("#"+modal_id).find('.modal-header').find('#sample_link').attr('href',href);
					new_rawData = obj.get('chartsDataSources').objectAt(0).rawData(null,pagination,0,null, obj.get('is_underlying_data'),this.value);
					new_count = new_rawData.count;
					new_rawData = new_rawData.results;	
					total_pages=Math.ceil(new_count/pagination);
					new_html= obj.generateHtml(modal_id,auth_token,filters,new_rawData,total_pages);

					$("#dvData"+modal_id).html(new_html);
					for(var j = 1; j <= total_pages; j++) {
					   $('#pagination'+modal_id).on('click','#pg_'+j, function(page) {
					      return function() {
					      	obj.gotoPage(page, count, modal_id, pagination);
					      };
					   }(j));	    	
					}

					// function for previous link.
					$('#pagination'+modal_id).on('click','#previous', function() {
			  			var page = $('#current_page').val();
			  			if(parseInt(page) > 1 ){
							obj.gotoPage(parseInt(page)-1, count, modal_id, pagination);
			  			}	      	
				    });

				    // function for next link.
				    $('#pagination'+modal_id).on('click','#next', function() {
			      		var page = $('#current_page').val();
			  			if(parseInt(page) < total_pages ){
							obj.gotoPage(parseInt(page)+1, count, modal_id, pagination);
			  			}	
				    });

				    $('input[name="exclude_id"]:checkbox').on('click', function(e) {
						var s=obj.get('excluded_ids');
				    	if(this.checked){
							s.push(this.id);
						}
						else{
							s.removeObject(this.id);
						}
				    });	
		    	}
		    	else{
		    		if(this.value=="showOnlyExcludedRows"){
		    			var new_html="No rows have been excluded";
		    			$("#dvData"+modal_id).html(new_html);
		    		}
		    	}
		    	
		    });
			
	    });

		$('#'+modal_id).find('#save_excluded_ids'+ chart_id).on('click', function(e) {
			var rows=$('input[name="exclude_id"]:checkbox')
			_.each(rows,function(r){
				$(r.parentElement.parentElement).removeAttr('style');
			})
			var c_ids=$('input[name="exclude_id"]:checkbox:checked');
			var ids=obj.get('excluded_ids');
			_.each(c_ids,function(c){
				$(c.parentElement.parentElement).attr('style','background-color:grey')
			});
			var exclude_obj={};
			exclude_obj.fieldname="cibi_id";
			exclude_obj.operator="NOT IN";
			exclude_obj.values=ids;
			obj.set('excludedRows', JSON.stringify(exclude_obj));
			var url="/charts/"+obj.get('id')+"/update_excluded_rows?auth_token=" + auth_token;
			$.ajax({
				url:url,
				type: 'post',
	            data: {
	            	'excluded_rows':obj.get('excludedRows')
	        		},
	            async: false,
	            success: function() {
	            	$("#"+modal_id).find('.modal-header').find('.optionsDiv').find('.rows-count').text(obj.get('excluded_ids').length+" rows excluded");
	            },
			});
	    });

		$('#'+modal_id).find('input[name="exclude_id"]:checkbox').on('click', function(e) {
			var s=obj.get('excluded_ids');			
			if(this.checked){
				s.push(this.id);
			}
			else{
				s.removeObject(this.id);
			}
	    });
	    
	    /* pagination functions end */

		modal_elem.modal('toggle');

		$('#'+modal_id).on('shown', function () {
			var vals=JSON.parse(obj.get('excludedRows'));
	    	if(vals){
	    		vals=vals.values;
	    	}
	    	else{
	    		vals=[];
	    	}
			obj.set('excluded_ids',vals);
			$("#"+modal_id).find('.modal-header').find('.optionsDiv').find('.rows-count').text(obj.get('excluded_ids').length+" rows excluded");
			obj.set('is_underlying_data',false);
		});

		$('#'+modal_id).on('hidden', function () {
			$("#"+modal_id).find('.modal-header').find('.filterDiv').show();
			$("#"+modal_id).find('.modal-header').find('.optionsDiv').hide();	
			obj.get('transaction').commit();	
			obj.set('is_underlying_data',false);
			obj.removeFilterValueFromChartFilterObj(filter);
			// dashboard.set('chartFilterObj',null); 
			// instead write a method that removes only the entries of this filter 
			// from chartfilterobj if dimension and operator of the filter matches 
			// with the chartFilterObj's object
			dashboard.set('filterOn', false);
			dashboard.set('filterKeys', null);
			// obj.set('chartFilter', "");
		});
    },

    removeFilterValueFromChartFilterObj: function(filter){
    	var obj=this;
    	var dashboard = obj.get('dashboard');
    	var chartFilterObj = dashboard.get('chartFilterObj');
    	if(chartFilterObj){
			if(filter instanceof Array){
				_.each(filter, function(f){
					var sameDimensionFilter = _.find(chartFilterObj, function(cf){
						if(cf.dimension == f.dimension && cf.operator == "="){
							return cf;
						}
					});
					if(sameDimensionFilter){
						if(sameDimensionFilter.value instanceof Array && sameDimensionFilter.value.length > 1){
							sameDimensionFilter.value.removeObject(f.value);
						}else{
							chartFilterObj = chartFilterObj.removeObject(sameDimensionFilter);
						}
					}
				});
			}else{
				var sameDimensionFilter = _.find(chartFilterObj, function(cf){
					if(cf.dimension == filter.dimension && cf.operator == "="){
						return cf;
					}
				});
				if(sameDimensionFilter){
					if(sameDimensionFilter.value instanceof Array && sameDimensionFilter.value.length > 1){
						sameDimensionFilter.value.removeObject(filter.value);
					}else{
						chartFilterObj = chartFilterObj.removeObject(sameDimensionFilter);
					}
				}
			}
			dashboard.set('chartFilterObj', chartFilterObj);
			dashboard.notifyPropertyChange('chartFilterObj');
			dashboard.drawAll();
		}
    },

    generateHtml: function(modal_id,auth_token,filters,details,total_pages){
    	var obj=this; 
    	var html="<div class='table-body' style='padding: 0px;'>";		
		html += '<table class="table table-bordered">';
		
	    var o = details[0];
	    html += "<tr>";
	    for(var i in o) {
	        if(i && i != 'x' && i != 'y' && i != 'parent' && i != 'depth' && i != 'id' && i != 'sum') { // dont show tree attribs
	          html += '<th>' + i + '</th>';
	        }
	    }
	    if(obj.get('is_underlying_data')){
	    	html += "<th> Exclude </th>";
	    }
	    html += "</tr>";

	    for(var j = 0; j < details.length; j++) {
	        var o = details[j];
	        if(obj.get('is_underlying_data')){
		    	html += "<tr "+obj.isExcluded(o.cibi_id,'tr')+">";
		    }
		    else{
		    	html +="<tr>";
		    }
	        for(var i in o) {
	          if(i && i != 'x' && i != 'y' && i != 'parent' && i != 'depth' && i != 'id' && i != 'sum') { // dont show tree attribs
	            html += '<td>' + displayTick(o[i]) + '</td>'
	          }
	        }
	        if(obj.get('is_underlying_data')){
	        	html += "<td><input type='checkbox' name='exclude_id' id='"+o.cibi_id+"' "+ obj.isExcluded(o.cibi_id,'checkbox') +"></td>";
	        }
	        html += "</tr>";
	    }
		html += '</table>';	
		html += '</div>';
		html += '<div id="pagination'+modal_id+'" class="pagination pagination-centered">'
		html += '<input class="hidden" style="width:0px;" type="text" value="1" id="current_page"></input>'
		html += '<ul>'
		    html += '<li class="disabled"><a href="javascript:void(0);" id="previous">&laquo;</a></li>'
		    html += '<li class="active"><a href="javascript:void(0);" id="pg_1">1</a></li>'
		    for(var j = 2; j <= Math.min(total_pages,5); j++) {
		    	html += '<li class=""><a href="javascript:void(0);" id="pg_'+j+'">'+j+'</a></li>'
			}
	    	if(Math.ceil(total_pages)>=5){
	    		html += '<li class="active"><a href="javascript:void(0);" id="pg_'+j+'">..</a></li>'
	    	}
	    if( total_pages > 1 ) {
	    	html += '<li class=""><a href="javascript:void(0);" id="next">&raquo</a></li>'	
	    }
	    
	    html += '</ul>'
		html += '<span class="pull-right" style="padding-right:10px;">Page 1 of '+ total_pages +'</span>'		  
		html += '</div>';

		return html;
    },

    isExcluded: function(cibi_id,elem){
    	var obj=this;
    	var vals=obj.get('excluded_ids');
    	if(vals.contains(cibi_id)){
    		if(elem=="checkbox")
    			return "checked";
    		else
    			return "style='background-color:gray;'";
    	}
    	else{
    		return "";
    	}
    },

    /* this method fetches the raw data required to show on the popup and
       draws the table and pagination content. */
    gotoPage: function(page, count, modal_id, pagination){
	    var filters = (this.get('is_underlying_data')) ? null : this.getFilters();
	    var cds = this.get('chartsDataSources').objectAt(0),
	    offset = pagination * (page - 1);
	    var drill_through_fields=(this.get('is_underlying_data')) ? null : this.get('drillThroughFields');
	    var option_value=$("#"+modal_id).find('.modal-header').find('.optionsDiv').find('input[name="excludeOptionsRadios"]:radio:checked').prop("value");
	    var details = cds.rawData(filters, pagination, offset, drill_through_fields, this.get('is_underlying_data'), option_value);
	    count = details.count;
	    details = details.results;
	    var dataSource = cds.get('dataSource');
	    var dimensionFormat = cds.get('dimensionFormatAs');
	    this.generateTable(details, modal_id);
	    this.generatePagination(page, count, modal_id, pagination);
    },

    /* this method generate the table content */
    generateTable: function(details, modal_id) {
    	var obj=this;
    	var html = ''
    	html += '<table class="table table-bordered">';
		
	    var o = details[0];
	    html += "<tr>";
	    for(var i in o) {
	        if(i && i != 'x' && i != 'y' && i != 'parent' && i != 'depth' && i != 'id' && i != 'sum') { // dont show tree attribs
	          html += '<th>' + i + '</th>';
	        }
	    }
	    if(obj.get('is_underlying_data')){
	    	html += "<th> Exclude </th>";
	    }
	    html += "</tr>";

	    for(var j = 0; j < details.length; j++) {
	        var o = details[j];
	        if(obj.get('is_underlying_data')){
		    	html += "<tr "+obj.isExcluded(o.cibi_id,'tr')+">";
		    }
		    else{
		    	html +="<tr>";
		    }
	        for(var i in o) {
	          if(i && i != 'x' && i != 'y' && i != 'parent' && i != 'depth' && i != 'id' && i != 'sum') { // dont show tree attribs
	            html += '<td>' + o[i] + '</td>'
	          }
	        }
	        if(obj.get('is_underlying_data')){
	        	html += "<td><input type='checkbox' name='exclude_id' id='"+o.cibi_id+"' "+ obj.isExcluded(o.cibi_id,'checkbox') +"></td>";
	        }
	        html += "</tr>";
	    }
		html += '</table>';		

		$('#dvData'+modal_id).find(".table-body").html(html);

		$('input[name="exclude_id"]:checkbox').on('click', function(e) {
			var s=obj.get('excluded_ids');			
			if(this.checked){
				s.push(this.id);
			}
			else{
				s.removeObject(this.id);
			}
	    });
    },

    /* this method generate the pagination content */
    generatePagination: function(current_page, count, modal_id, pagination) {
    	var total_pages = Math.ceil(count/pagination);
		if(current_page <= 3){
			var min = 1;
			var max = (total_pages<5) ? total_pages : 5; 
		} else if(current_page >= total_pages - 2) {
			var min = (total_pages<5) ? 1 : total_pages -4;
			var max = total_pages;
		} else {
			var min = Math.max(1,current_page-2);
			var max = Math.min(total_pages,current_page+2);
		}
		var state = (current_page == 1 || current_page == total_pages) ? 'disabled' : ''
    	html = ''
    	html += '<input class="hidden" style="width:0px;" type="text" value="'+current_page+'" id="current_page"></input>'
		html += '<ul>'
		html += '<li class="'+state+'"><a href="javascript:void(0);" id="previous">&laquo;</a></li>'
	    if(current_page>3 && total_pages>5){
	    	html += '<li class="disabled"><a href="javascript:void(0);">..</a></li>'
	    }
		for(var j = min; j <= max; j++) {
			var style = (j==current_page) ? 'active' : ''
		  	html += '<li class='+style+'><a href="javascript:void(0);" id="pg_'+j+'">'+j+'</a></li>'
		}
	    if(total_pages>5 && current_page+2 < total_pages){
	    	html += '<li class="disabled"><a href="javascript:void(0);">..</a></li>'
	    }
		html += '<li class="'+state+'"><a href="javascript:void(0);" id="next">&raquo</a></li>'
		html += '</ul>'
		html += '<span class="pull-right" style="padding-right:10px;">Page '+ current_page +' of '+ total_pages +'</span>'		
		$('#pagination'+modal_id).html(html);
    },

    setChartDomain: function(domain) {
    	var obj = this;
    	obj.set('chart_domain', domain);
    },

	/**
		It draws X Axis.
        
		@method drawXAxis
		@param {Object} svg
		@param {String} domain
		@return {Object} x x axis scale.
	*/

    drawXAxis: function(svg, domain, yaxis, scale_type,chartData) {
    	var obj = this;
    	var dom;
    	var tickLength;
    	var marginBottom = this.get('marginBottom');

	    var	width = this.get('width') - this.get('marginLeft') - this.get('marginRight'),
	    	height = this.get('height') - marginBottom - this.get('marginTop');
		
		var x;

		var formatDate;
		var parseDate;

		var dimension=this.get('chartsDataSources').objectAt(0).get('dimensionName');
		var dimensionFormat=this.get('dimensions').objectAt(0).get('formatAs');
		var dimensionDataType=this.get('chartsDataSources').objectAt(0).get('dataSource').getDataType(dimension);

    	if(obj.get('axesConfigsObj') 
    		&& obj.get('axesConfigsObj').xDomainMinValue 
    		&& obj.get('axesConfigsObj').xDomainMaxValue 
    		&& obj.get('axesConfigsObj').xDomainMaxValue > obj.get('axesConfigsObj').xDomainMinValue){
    		dom=[obj.get('axesConfigsObj').xDomainMinValue,obj.get('axesConfigsObj').xDomainMaxValue];
    		tickLength=Math.abs(domain.indexOf(dom[0].toString())-domain.indexOf(dom[1].toString()))+1;
    	}
    	else{
    		dom=domain;
    		// tickLength=d3.min([domain.length , 10]);
    		tickLength = Math.floor(width * (5/100));
    		tickLength = (domain.length < tickLength) ? domain.length:tickLength ;
    	}
    	obj.setDateFormats();
		if(dimensionDataType=="date" || dimensionDataType == "datetime"){
			
			formatDate=obj.get('formatDate');
			parseDate=obj.get('parseDate');

			if(parseDate && this.get('chartType')!="1" && this.get('chartType')!="6")
			{				
				this.set("scale_type","time");
				x = d3.time.scale()
	            .range([0, width])
	            .domain(d3.extent(dom, function(d) { 
	            	return (parseDate) ? parseDate(d.toString()) : d.toString(); 
	            }));
			}
			else
			{
				x = d3.scale.ordinal()
			    .rangeRoundBands([0, width], 0.2)
			    .domain(domain);
			    this.set("scale_type","ordinal");
			}

		}
		else if (isNumericDataType(dimensionDataType) && !(scale_type)) {
 			x = d3.scale.linear()
 		    .range([0, width])
		    .domain(d3.extent(dom, function(d) { 
		    	return parseInt(d); 
		    })).nice();
		    this.set("scale_type","linear");
        }
        else if(scale_type=="linear")
        {
        	//obj.set('noDimensions', false);	
        }
        else {
			x = d3.scale.ordinal()
		    .rangeRoundBands([0, width], 0.2)
		    .domain(domain);
		    this.set("scale_type","ordinal");
		}		

        yaxis = yaxis || height;

        if(this.get('scale_type')=="time")
        {
	        	var xAxis = d3.svg.axis()
		          .scale(x)
		          .ticks(tickLength)
		          .tickFormat(formatDate)
		          .orient("bottom");
        }
        else if(this.get('scale_type')=="linear")
        {
        	var xAxis = d3.svg.axis()
		         .scale(x)
		         .tickFormat(function(d){
		         		return formatValue(d,((obj.get('axesConfigsObj') && obj.get('axesConfigsObj').xAxisDisplayUnit) ? obj.get('axesConfigsObj').xAxisDisplayUnit : ""));   		
	      			})
		         .orient("bottom");        	
        }
        else{
        	var xAxis = d3.svg.axis()
	         .scale(x)
	         .tickFormat(function(t){
	         	if(formatDate)
	         	{
	         		return formatDate(parseDate(t));
	         	}
	         	else
	         	{
	         		var tick=displayTick(t);
		      		if(tick.length > 12)
		      		{
		      			return tick.substr(0,12) + "...";
		      		}
		      		else{
		      			return tick;
		      		}
	         	}	      		
      		})
	         .orient("bottom");        	
        }      	
      	
        var format=this.getTextFormatting();
        svg.append("g")
        	.attr("class","x axis")
        	.style('shape-rendering', 'crispEdges')
            .style('fill', 'none')
            .style('stroke', 'black')
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
            .attr("transform", "translate(0," + yaxis + ")")
            .call(xAxis.tickSize(6,0,0))
            .selectAll("text")
            .style("text-anchor", format.text_anchor)
            .attr("dx", format.dx)
            .attr("dy", format.dy)
            .attr("transform", function(d) {
            	var rotateAngle=(obj.get('axesConfigsObj') && obj.get('axesConfigsObj').xAxisRotateAngle) ? (obj.get('axesConfigsObj').xAxisRotateAngle) : 45;
            	return "rotate(-"+rotateAngle+")";
            })
            .on('mouseover', function(d) {
				var div = d3.select("#chart-tooltip");
			    div.transition()
			    .duration(500)
			    .style("opacity", 0.9);
			    var html;
			    if(formatDate){
			    	if(typeof(d)=="string"){
			    		html=formatDate(parseDate(d));
			    	}
			    	else{
			    		html=formatDate(d);
			    	}
			    }
			    else{
			    	html=displayTick(d);
			    }
			    div.html(html)
			    .style("left", (d3.event.pageX) + "px")
			    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', function() {
            	obj.chartElementOnMouseExit();
            });

        svg.selectAll("g.x")
	    	.selectAll("text")
	    	.style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
	    	.style("font-size", "11px")
	    	.style("letter-spacing", "0px")
            .style("fill", "black")            
            .style("stroke", "none")
            .style("word-wrap", "break-word");

        var xLabel=(obj.get('axesConfigsObj') && obj.get('axesConfigsObj').xAxisLabel) ? obj.get('axesConfigsObj').xAxisLabel : "";

        svg.selectAll("g.x")
        	.append("text")        	
            .attr("y", marginBottom - 5)
            .attr("x", width/2)
            .style("text-anchor","middle")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
        	.style("font-weight", "bold")
        	.style("fill", "black")            
            .style("stroke", "none")
        	.text((xLabel.length>20)? xLabel.substr(0,20): xLabel)
        	.on("mouseover",function(){
        		var div = d3.select("#chart-tooltip");
			    	div.transition()
			    	.duration(500)
			    	.style("opacity", 0.9);
			    var html=displayTick(xLabel);
			    div.html(html)
			    	.style("left", (d3.event.pageX) + "px")
			    	.style("top", (d3.event.pageY - 28) + "px");
        	})
        	.on("mouseout",function(){
        		obj.chartElementOnMouseExit();
        	}); 

       	svg.append("g")         
	        .attr("class", "x grid")
	        .attr("transform", "translate(0," + yaxis + ")")
	        .style('shape-rendering', 'crispEdges')
            .style('fill', 'none')   
            .style("stroke","black")         
	        .call(xAxis.tickSize(-height, 0, 0).tickFormat(""));

	    svg.selectAll(".x.grid")
	    	.selectAll("line")
            .style('stroke', '#ebebeb')
            .style("stroke-dasharray","2");

        if(svg.selectAll(".x.grid").select(".tick")[0]){
        	if($(svg.selectAll(".x.grid").select(".tick")[0]).attr("transform").split("(")[1].split(",")[0]=="0"){
	        	svg.selectAll(".x.grid")
	        		.select("line")
	        		.style('stroke', 'black')
	            	.style("stroke-dasharray","0");
	        }	
        }

	    svg.selectAll(".x.grid")
	    	.selectAll("path")
	    	.style("opacity",0);

        return x;
    },

    setDateFormats: function(){
    	var obj=this;
    	var formatDate;
		var parseDate;

		var dimension=obj.get('chartsDataSources').objectAt(0).get('dimensionName');
		var dimensionFormat=obj.get('chartsDataSources').objectAt(0).get('dimensionFormatAs');
		var dimensionDataType=obj.get('chartsDataSources').objectAt(0).get('dataSource').getDataType(dimension);

		if(dimensionDataType == "date" || dimensionDataType == "datetime") {
			if(dimensionFormat=="Year"){
				formatDate=d3.time.format("%Y");
				parseDate=d3.time.format("%Y").parse;
			}else if(dimensionFormat=="Month"){
				formatDate = d3.time.format("%b");		
				parseDate = d3.time.format("%m").parse;
			}else if(dimensionFormat=="Quarter"){
				formatDate=formatDateAsQuarter;
				parseDate=parseDateAsQuarter;
			}else if(dimensionFormat=="Month Year"){
				formatDate = d3.time.format("%Y %b");
				parseDate = d3.time.format("%Y %m").parse;
			}else if(dimensionFormat=="Hours"){
				formatDate = d3.time.format("%H");
				parseDate = d3.time.format("%H").parse;
			}else if(dimensionFormat == "Day" || dimensionFormat == "Week"){
				// formatDate = d3.time.format("%a");
				// parseDate = d3.time.format("%w").parse;
				formatDate=null;
				parseDate=null;
			}else{
				formatDate=d3.time.format("%d-%m-%Y");
				parseDate=d3.time.format("%Y-%m-%d").parse;
			}			
		} else {
			formatDate = false;
			parseDate = false;
		}
		obj.set("formatDate",formatDate);
		obj.set("parseDate",parseDate);
    },

	/**
		It draws Y Axis.
        
		@method drawYAxis
		@param {Object} svg
		@param {String} domain
		@param {String} label
		@return {Object} y y axis scale.
	*/
    drawYAxis: function(svg, domain, label) {
    	var obj=this;
    	var	height = this.get('height') - this.get('marginBottom') - this.get('marginTop');
    	var	width = this.get('width') - this.get('marginLeft') - this.get('marginRight');

    	var ticksLength = height*(10/100);
    	ticksLength = (ticksLength > 10) ? 10:ticksLength;
    	
    	var dom;
    	if(obj.get('axesConfigsObj') && obj.get('axesConfigsObj').yDomainMinValue && obj.get('axesConfigsObj').yDomainMaxValue
    		&& obj.get('axesConfigsObj').yDomainMinValue < obj.get('axesConfigsObj').yDomainMaxValue){
    		if(obj.get('axesConfigsObj').yDomainMinValue<domain[0]){
    			dom=[domain[0],obj.get('axesConfigsObj').yDomainMaxValue];
    		}
    		else{
    			dom=[obj.get('axesConfigsObj').yDomainMinValue,obj.get('axesConfigsObj').yDomainMaxValue];
    		}
    	}
    	else{
    		dom=domain;
    	}
    	
    	
    	var global_settings = Cibi.Auth.get('globalSetting');
		var y = d3.scale.linear()
        		.range([height, 0])
        	 	.domain(dom);

	    var yAxis = d3.svg.axis()
        	.scale(y)
        	.tickFormat(function(d) {
        		number_format = ((obj.get('axesConfigsObj') && obj.get('axesConfigsObj').yAxisDisplayUnit && obj.get('axesConfigsObj').yAxisDisplayUnit != 'No Units') ? obj.get('axesConfigsObj').yAxisDisplayUnit : (global_settings ? global_settings.get('numberFormat') : ""))
            	return formatValue(d,number_format);
          	})
          	.ticks(ticksLength)
          	.orient("left");
          	
         
        svg.append("g")
            .attr("class", "y axis")
            .style('shape-rendering', 'crispEdges')            
            .style('stroke', 'black')
            .style('fill', 'none')
            .style("font-weight", "200")
            .attr("transform", "translate(0,0)")
            .call(yAxis.tickSize(6,0,0));

	    svg.selectAll("g.y")
	    	.selectAll("text")
	    	.style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
	    	.style("font-size", "11px")
	    	.style("letter-spacing", "0px")
            .style("fill", "black")            
            .style("stroke", "none")
            .style("word-wrap", "break-word");

        svg.selectAll("g.y")
	    	.selectAll("path")
            .style("stroke", "black"); 

        var yLabel=(obj.get('axesConfigsObj') && obj.get('axesConfigsObj').yAxisLabel) ? obj.get('axesConfigsObj').yAxisLabel : "";

        svg.selectAll("g.y")
        	.append("text")  
            .attr("transform", "rotate(-90)")
        	.attr("y", -20)
            .attr("x", -(height / 2))
            .attr("dy", "-3em")
            .style("text-anchor","middle")
            .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
        	.style("font-weight", "bold")
        	.style("fill", "black")            
            .style("stroke", "none")
        	.text((yLabel.length > 20) ? yLabel.substr(0,20) : yLabel)
        	.on("mouseover",function(){
        		var div = d3.select("#chart-tooltip");
			    	div.transition()
			    	.duration(500)
			    	.style("opacity", 0.9);
			    var html=displayTick(yLabel);
			    div.html(html)
			    	.style("left", (d3.event.pageX) + "px")
			    	.style("top", (d3.event.pageY - 28) + "px");
        	})
        	.on("mouseout",function(){
        		obj.chartElementOnMouseExit();
        	}); 

		svg.append("g")         
			.attr("class", "y grid")
			.style('shape-rendering', 'crispEdges')
            .style('fill', 'none')
            .style('stroke', 'black')
			.call(yAxis.tickSize(-width, 0, 0).tickFormat(""));

	    svg.selectAll(".y.grid")
	    	.selectAll("line")
            .style('stroke', '#ebebeb')
            .style("stroke-dasharray","2");

        svg.selectAll(".y.grid")
        	.selectAll("path")
        	.style("opacity",0);

        return y;

    },

	/**
		It creates and returns an svg element attached to the charts element id.
        
		@method getSvgElement
		@return {Object} svg svg element
	*/
    getSvgElement: function(margin_left, margin_top) {
    	var marginLeft, marginTop;
    	if(margin_left || margin_left==0){
    		marginLeft=margin_left;
    	}else{
    		marginLeft=this.get('marginLeft') || 0;
    	}
    	if(margin_top || margin_top==0){
    		marginTop=margin_top;
    	}else{
    		marginTop=this.get('marginTop') || 0;
    	}	
      	var svg = d3.select("#" + this.get('elemId')).append("svg")
    		.attr("width", this.get('width'))
        	.attr("height", this.get('height'))
        	.append("g")
        	.attr("transform", "translate(" + marginLeft + "," + marginTop + ")");    		         	     
        return svg;	
    },

    /**
    	Color Scale defines a D3 ordinal scale with range of 50 beautiful colors we want to use in the charts
    	50 is the number we want to get to, thinking we will have 50sh color categories in a chart at max.
    	May need revision
    */
    colorScale: function() {
    	var current_user = Cibi.Auth.get('currentUser');
    	var colors = current_user.getColors();
    	var colorScale = d3.scale.ordinal()
    						.range(colors);
    	//return d3.scale.category10();
 		return colorScale;   						
    },

    getChartTip: function(){
    	var tip = d3.tip()
    			 .attr('class','d3-tip');

    	return tip;
    },

    bar: function() {
    	var current_user = Cibi.Auth.get('currentUser');
    	var barColor = current_user.barColor();
    	return barColor;
    },

    line: function() {
    	var current_user = Cibi.Auth.get('currentUser');
    	var lineColor = current_user.lineColor();
    	return lineColor;
    },

    area: function() {
    	var current_user = Cibi.Auth.get('currentUser');
    	var areaColor = current_user.areaColor();
    	return areaColor;
    },

    errorBar: function() {
    	var current_user = Cibi.Auth.get('currentUser');
    	var errorBarColor = current_user.errorBarColor();
    	return errorBarColor;
    },

    controlKey: function() {
    	var current_user = Cibi.Auth.get('currentUser');
    	var controlKeyColor = current_user.controlKeyColor();
    	return controlKeyColor;
    },

    statisticalRelevance: function() {
    	var current_user = Cibi.Auth.get('currentUser');
    	var statisticalRelevanceColor = current_user.statisticalRelevanceColor();
    	return statisticalRelevanceColor;
    },

    hasTimeToggle: function() {
    	var obj = this;
		var chart_type = obj.get('chartType');
		var dimension = obj.get('dimensions').objectAt(0);
		var hasTimeToggle;
		if(chart_type == '8' ||chart_type == '9'||chart_type == '12' || chart_type == '11'){
			var ds = obj.get('chartsDataSources').objectAt(0).get('dataSource');
			var data_type = ds.getDataType(dimension.get('fieldName'));
			if(data_type == "date" || data_type == "datetime"){
				hasTimeToggle = true;
			}else{
				hasTimeToggle = false;
			}
		}else{
			hasTimeToggle = false;
		}
		return  hasTimeToggle;
	}.property('chartType', 'isSetup'),


	hasLegend: function () {
		var chart_type = this.get('chartType');
		var hasLegend = !['0', '3', '7', '8','11', '14', '15','19'].contains(chart_type);
		if(hasLegend && ( chart_type == '1' || chart_type == '13') ) {
			var num_measures = this.get('measures').get('length');
			hasLegend = num_measures > 1;
			if(num_measures == 1) {
				var cds = this.get('chartsDataSources').objectAt(0);
				hasLegend = cds.get('depth') ? true : false;
				if(!hasLegend) {
					hasLegend = this.get('configObj')["highlight_statistical_relevance"]
				}
			}
		}
		else if(chart_type=="8" || chart_type=="11"){
			var c=JSON.parse(this.get('configs'));
			if(c && c.forecastObject && c.forecastObject.enableForecast){
				hasLegend=true;
			}
		}
		else if(chart_type == "10"){
			var cds = this.get('chartsDataSources').objectAt(0);
			var depth = cds.get('depth');
			if(!depth){
				hasLegend = false;
			}
		}
		return hasLegend;
	}.property('chartType', 'isSetup', 'forecast'),

    /**	
    	This method draws legend for the chart.

		@method drawChartLegend
    */

    drawChartLegend: function(keys, z, filterOnClick, labels) {
    	var obj = this,
    	chart_id = obj.get('id'),
        legend_id = "legend-" + chart_id,
    	svg_height = obj.get('height'), 
    	width = obj.get('width'),
    	legend_elem = $("#" + this.get('legendId')),
    	labels_exist = labels ? true : false;

    	if(obj.get('chartsDataSources').objectAt(0).get('depth')){
	        var dimension=obj.get('dimensions').objectAt(1);
        }else{
        	 var dimension=obj.get('dimensions').objectAt(0);
        }

        var formats, formatDate, parseDate;
        if(!obj.forecast){
			formats=obj.getDateFormatFunctions(dimension);
			formatDate = formats["formatDate"];
			parseDate = formats["parseDate"];	
        }    	

        var html = "";

    	html +='<div id = "chart-legend" style="max-width:'+width+'px; overflow:auto; font-size:11px;">';
      
        html +='<table>';
        var j;
        html +='<tr>';	  	
	    for(j = 0; j <= keys.length/2; j++) {   
	    	var label_str = labels ? labels[j] : keys[j];
	    	var isStr = [6,10].contains(obj.get('chartType'));
	    	
	    	label_str = (!labels_exist && formatDate && !isStr && obj.get('chartType') != 6) ? formatDate(parseDate(label_str)) : label_str
	        
	        html += '<td class="legend_rect"><div id="rect_'+legend_id+j+'" class="rect" data-toggle="tooltip" data-placement="bottom" title="' + label_str + '" style=" background-color:'+z(keys[j])+'" ></div></td>';
	        html += '<td class="legend_label">' + label_str + '</td>';   
	    }
      	html += "</tr>";
      	html += '<tr>';	  	
	    for(var k = j; k < keys.length; k++) { 
	    	var label_str = labels ? labels[k] : keys[k]; 
	    	var isStr = [6,10].contains(obj.get('chartType'));
	    	label_str = (!labels_exist && formatDate && !isStr) ? formatDate(parseDate(label_str)) : label_str  	  
            html += '<td class="legend_rect"><div id="rect_'+legend_id+k+'" class="rect" data-toggle="tooltip" data-placement="bottom" title="' + label_str + '" style=" background-color:'+z(keys[k])+'" ></div></td>';
	        html += '<td class="legend_label">' + label_str + '</td>';   
	    }
      	html += "</tr>"; 
		html += '</table>';
		html +='</div>';	

        legend_elem.html(html);
		$('.rect').tooltip();
  
  		if(filterOnClick && obj.get('isFullScreen') == false) {
	 	    for(var j = 0; j < keys.length; j++) {
	 	    	var clicked_label = labels ? labels [j] : false;
		   	  	$("#rect_" +legend_id + j).on('click', obj.getOnClickFunction(keys[j], j,obj,filterOnClick, clicked_label));   
		    }
  		}
    },



  getOnClickFunction: function(keys,j,obj,filterOnClick, labels) {
	  var fn = function() {
	   	        if(filterOnClick) {
	   	        	var display_key = labels ? labels : keys
	   	        	var labels_exist = labels ? true : false;
			    	
			    	if(obj.get('chartsDataSources').objectAt(0).get('depth')){
				        var dimension=obj.get('dimensions').objectAt(1);
			        }else{
			        	 var dimension=obj.get('dimensions').objectAt(0);
			        }
			        var formats=obj.getDateFormatFunctions(dimension);
			        var formatDate = formats["formatDate"];
			        var parseDate = formats["parseDate"];	
			        display_str = (!labels_exist && formatDate) ? formatDate(parseDate(display_key)) : display_key
			        display_str = display_str.length > 14 ? display_str.substr(0,15) + " .." : display_str;

	         	    obj.set('legendFilter', {key: display_key, index: j, display_str: display_str});
	         	    obj.draw(); 
	    	    	}
	    	    }
	        return fn;

  },
    displayChartError: function(msg) {
		error_msg = "<h4 class='alert alert-error'>"+msg+"</h4>";
		$("#" + this.get('elemId')).html(error_msg);
		this.set('error', true);    	
    },

    yellow: function() {
    	return "#FFFF00";
    },

    green: function() {
    	return "#00E600";
    },

    red: function() {
    	return "#FF3D3D";
    },
    /**
     Access Control Methods 
    **/
	can_edit: function() {
		var dashboard = this.get('dashboard');
		return dashboard.get('can_edit');
	}.property('Cibi.Auth.currentUser.isLoaded'),

	can_destroy: function() {
		var dashboard = this.get('dashboard');
		return dashboard.get('can_destroy');
	}.property('Cibi.Auth.currentUser.isLoaded'),

	current_page: function(){
		var obj=this;
		if(!obj.get('offset')){
			obj.set('offset', 0);
		}
		return (parseInt(obj.get('offset'))+1);
	}.property('offset'),

	getFilters: function(){
		var obj = this;
        var filters = obj.get('dashboard').getAllFilters();
        return filters;
	},

	getTextFormatting: function(){
		var obj=this;
		var angle=(obj.get('axesConfigsObj') && obj.get('axesConfigsObj').xAxisRotateAngle) ? (obj.get('axesConfigsObj').xAxisRotateAngle) : 45;
		var format=new Object();
		if(angle==90){
			format.dy="-0.50em";
			format.dx="-0.75em";
			format.text_anchor="end";
		}
		else if(angle==0){
			format.dy="0.50em";
			format.dx="0em";
			format.text_anchor="middle";
		}
		else{
			format.dy="0.75em";
			format.dx="-0.2em";
			format.text_anchor="end";
		}
		return format;
	},


    addClipPathElement: function(svg) {
		var obj=this;
		if(obj.get('axesConfigsObj')){
			if(obj.get('chartType')==6){
				if((obj.get('axesConfigsObj').yDomainMinValue 
		            && obj.get('axesConfigsObj').yDomainMaxValue
		            && obj.get('axesConfigsObj').yDomainMinValue < obj.get('axesConfigsObj').yDomainMaxValue)
		          || (obj.get('axesConfigsObj').rightYDomainMinValue && obj.get('axesConfigsObj').rightYDomainMaxValue
		            && obj.get('axesConfigsObj').rightYDomainMinValue < obj.get('axesConfigsObj').rightYDomainMaxValue)){
						svg.append("defs").append("svg:clipPath")
							.attr("id", "clip-" + obj.get('elemId'))
							.append("svg:rect")
							.attr("width", (obj.get('width')-obj.get('marginLeft')-obj.get('marginRight')))
							.attr("height", (obj.get('height')-obj.get('marginTop')-obj.get('marginBottom')));
        		}
			}
			else if(obj.get('chartType')=='horizontal-bar' || obj.get('chartType')==10){
				if(obj.get('axesConfigsObj') 
			    	&& obj.get('axesConfigsObj').xDomainMinValue
			    	&& obj.get('axesConfigsObj').xDomainMaxValue
			    	&& obj.get('axesConfigsObj').xDomainMinValue < obj.get('axesConfigsObj').xDomainMaxValue){
						svg.append("defs").append("svg:clipPath")
							.attr("id", "clip-" + obj.get('elemId'))
							.append("svg:rect")
							.attr("width", (obj.get('width')-obj.get('marginLeft')-obj.get('marginRight')))
							.attr("height", (obj.get('height')-obj.get('marginTop')-obj.get('marginBottom')));
				}
			}
			else{
				if(obj.get('axesConfigsObj').yDomainMinValue 
		          && obj.get('axesConfigsObj').yDomainMaxValue
		          && obj.get('axesConfigsObj').yDomainMinValue < obj.get('axesConfigsObj').yDomainMaxValue){
					svg.append("defs").append("svg:clipPath")
		            .attr("id", "clip-" + obj.get('elemId'))
		            .append("svg:rect")
		            .attr("width", (obj.get('width')-obj.get('marginLeft')-obj.get('marginRight')))
		            .attr("height", (obj.get('height'))-obj.get('marginTop')-obj.get('marginBottom'));
				}
			}
		}
    },

    getClipPathUrl: function(){
    	var obj=this;
		if(obj.get('axesConfigsObj')){
			if(obj.get('chartType')=='horizontal-bar' || obj.get('chartType')==10){
				if(obj.get('axesConfigsObj').xDomainMinValue
			    	&& obj.get('axesConfigsObj').xDomainMaxValue
			    	&& obj.get('axesConfigsObj').xDomainMinValue < obj.get('axesConfigsObj').xDomainMaxValue){
	                return "url(#clip-" + obj.get('elemId') + ")"
	              }
	              else{
	                return "";
	              }
			}
			else{
				if(obj.get('axesConfigsObj').yDomainMinValue
					&& obj.get('axesConfigsObj').yDomainMaxValue
					&& obj.get('axesConfigsObj').yDomainMinValue < obj.get('axesConfigsObj').yDomainMaxValue){
						return "url(#clip-" +obj.get('elemId') + ")"
				}
				else{
					return "";
				}	
			}
		} 
		else{
			return "";
		}
    },

    getChartElementData: function(d, otherData, tip, svg) {
		var obj = this;
	    var html = obj.getChartElementTipData(d, otherData, tip, svg);
	    tip.html(html);
	}, 

	getChartElementTipData: function(d, otherData, tip, svg){
		var obj=this;
		var cds=obj.get('chartsDataSources').objectAt(0);
		var fact = otherData.fact || cds.get('factDisplay') || cds.get('fact');
		var factType = otherData.factType || cds.get('factType');
        var factUnit= otherData.factUnit || cds.get('factUnit');
        var i=otherData.index;
        var details=otherData.details;
        var total_val=otherData.total_val;
        var key=d.key;
        var value;
        if(d.value || d.value==0){
        	value=d.value;
        }else if(d[fact] || d[fact] == 0){
        	value=d[fact];
        }else if(d.y || d.y==0){
        	value = d.y
        }else{
        	value=null;
        }

        var depth = displayTick(d['zkey']);

        var highlightRule=obj.get('highlightRule');
        var statsData;
        if(obj.statsData){
          statsData=obj.statsData;
        }
        var statsVal;
        if(highlightRule && highlightRule.get('enable_highlight')) {
          if(key==JSON.parse(highlightRule.get('configs')).control_field){
            statsVal=null;
          }else{
            statsVal=statsData[i]["pValue"];
          }
        }
        var semVal=null;
        if(highlightRule && highlightRule.get('enable_highlight') && highlightRule.get('enable_sem')) {
          semVal=statsData[i]["sem"];
        }
		svg.call(tip);
		var dimensionFormat=cds.get('dimensionFormatAs');
	    var val = "";
	    var html = "<table style='text-align:left;'>";
	    if(key){
	    	html += "<tr><td>";
		    html += obj.get('chartsDataSources').objectAt(0).get('dimensionDisplay');
		    html += "</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
		    if(key.length > 20){
		    	html += obj.get('formatDate') ? obj.get('formatDate')(obj.get('parseDate')(key)) : key.substr(0,20) + "<br>" + key.substr(20);
		    }else{
		    	html += obj.get('formatDate') ? obj.get('formatDate')(obj.get('parseDate')(key)) : key;
		    }
		    html += "</td></tr>";
	    }
	    if(depth){
	        var dimension=obj.get('dimensions').objectAt(1);
	        var formats=obj.getDateFormatFunctions(dimension);
	        var formatDate = formats["formatDate"];
	        var parseDate = formats["parseDate"];
	    	html += "<tr><td>";
		    html += obj.get('chartsDataSources').objectAt(0).get('depthDisplay');
		    html += "</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
		    if(depth.length > 20){
		    	html += formatDate ? formatDate(parseDate(depth)) : depth.substr(0,20) + "<br>" + depth.substr(20);
		    }else{
		    	html += formatDate ? formatDate(parseDate(depth)) : depth;
		    }
		    html += "</td></tr>";	
	    }

	    // html += key; 

	    if(value || value==0) {
		    var displayFormat=obj.get('axesConfigsObj').yAxisDisplayUnit;
		    if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
		    	var val = CommaFormatted(value, displayFormat,cds.get('factFormat'));
		    }else{
		    	var val = CommaFormatted(value, displayFormat);
		    }
		    var percent="";
		    if (total_val) {
		    	percent=d3.format('.2%')(value/total_val);	
		    }		   
		    if (factUnit) {
		    	if(factUnit['prefix'] == "USD") {
		    		val = " $ " + val;
		    	} else if(factUnit['prefix'] == "Rs") {
					val = " ₹ "	+ val;
		    	} else if(factUnit['prefix'] == "Euro"){
		    		val = "€" + val;
		    	} 

		    	if(factUnit['suffix']){
					val = val + " " + factUnit["suffix"] + " ";
		    	}	
		    }

		    if(fact) {
		    	html += "<tr><td>";
			    html += fact;
			    html += "</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
			    html += val;
			    html += "</td></tr>";	
		    	// html += "<br/> ( " + fact + " : " + val + " )";
			    if(percent) {
			    	html += "<tr><td>&nbsp;</td><td>";
			    	html += "&nbsp;";
			    	html += "</td><td>";
				    html += percent;			    
				    html += "</td></tr>";
			    	// html += "<br />" + percent;
			    } 			    
			}
	    }

	    if(statsVal || statsVal==0){
	    	html+="<tr><td>";
	    	html+=obj.get('highlightRule').get('comparison_function');
	    	html+="</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
	    	html+=d3.format('.5f')(statsVal);
	    	html+="</td></tr>";
	    }

	    if(semVal || semVal==0){
	    	html+="<tr><td>";
	    	html+="Standard error of mean";
	    	html+="</td><td>&nbsp;&nbsp;:&nbsp;&nbsp;</td><td>";
	    	html+=d3.format('.5f')(semVal);
	    	html+="</td></tr>";
	    }

	    if(details){
	    	html += "<tr><td colspan='2'>";
		    html += details;
		    html += "</td></tr>";
	    }
	    html += "</table>";
	    return html;
	},

    getDateFormatFunctions: function(dimension){
    	var obj=this;
    	var dimensionName=dimension.get('fieldName');
		var dimensionFormat=dimension.get('formatAs');
		var dimensionDataType=obj.get('chartsDataSources').objectAt(0).get('dataSource').getDataType(dimensionName);
		var formatDate;
		var parseDate;
		if(dimensionDataType=="date"){
	    	if(dimensionFormat=="Year"){
				formatDate=d3.time.format("%Y");
				parseDate=d3.time.format("%Y").parse;
			}
			else if(dimensionFormat=="Month"){
				formatDate = d3.time.format("%b");		
				parseDate = d3.time.format("%m").parse;
			}
			else if(dimensionFormat=="Quarter"){
				formatDate=formatDateAsQuarter;
				parseDate=parseDateAsQuarter;
			}
			else if(dimensionFormat=="Month Year"){
				formatDate = d3.time.format("%Y %b");
				parseDate = d3.time.format("%Y %m").parse;
			}
			else if(dimensionFormat=="Day" || dimensionFormat=="Week"){
				formatDate = null;
				parseDate = null;
			}
			else{
				formatDate=d3.time.format("%d-%m-%Y");
				parseDate=d3.time.format("%Y-%m-%d").parse;
			}
		}
		return {
			'formatDate' : formatDate,
			'parseDate' : parseDate
		};
    },
});

