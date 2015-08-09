Cibi.NewChartsDataSourceView = Ember.View.extend({
	template: Ember.Handlebars.compile("{{partial 'charts/dataSources'}}"),

	didInsertElement: function(){
		console.log(this._parentView._parentView.chartType);
	},
	
	dimensionsSupportedFormats:function(){
		var dataSourceId=this.get('dataSourceId');
		if(!dataSourceId) {
			return [];
		}
		var dimension=this.get('dimensionName');
		var ds=this.get('controller').getDataSource(dataSourceId);
		var dataType=ds.getDataType(dimension);
		if(dataType=="date")
		{
			var arr=['','Month', 'Quarter', 'Year', 'Month Year'];
			//var arr=t
			return arr;
		}
		else
		{
			this.set('dimensionFormatAs','');
			return [];
		}	
	}.property('dimensionName'),	

	dimensionsArrOld: function() {
		var dataSourceId = this.get('dataSourceId');
		if(!dataSourceId) {
			return [];
		}
		var arr = this.get('controller').getDimensions(dataSourceId);
		return [''].concat(arr);
	}.property('dataSourceId', 'controller.data_sources'),

	dimensionsArr: function() {
		var dataSourceId = this.get('dataSourceId');
		if(!dataSourceId) {
			return [];
		}
		var arr = this.get('controller').getFields(dataSourceId);
		return [''].concat(arr);
	}.property('dataSourceId', 'controller.data_sources'),

	fieldsArr: function() {
		var dataSourceId = this.get('dataSourceId');
		if(!dataSourceId) {
			return [];
		}
		var arr = this.get('controller').getFields(dataSourceId);
		return [''].concat(arr);
	}.property('dataSourceId', 'controller.data_sources'),

	factFormats: function() {
		return [
			{ name: '', key: ''},
			{ name: 'Sum of Fact', key: 'sum'},
			{ name: 'Mean of Fact', key: 'avg'},
			{ name: 'Standard Deviation of Fact', key: 'stddev'},
			{ name: 'Standard Error of Mean of Fact', key: 'sem'},			
			{ name: 'Number of Missing Entries in Fact Column', key: 'noops'},
			{ name: '% Missing Entries of Total Count', key: 'noopspc'}, 
			{ name: 'Number of Valid Entries (Count)', key: 'count'},
			{ name: '% Valid Entries of Total Count', key: 'opspc'},
			{ name: 'Count unique fact fields', key:'count,distinct'},
		];
	}.property(''),

	isPivotTableChart: function(){
		return (this._parentView._parentView.chartType=="grouped_table");
	}.property('_parentView._parentView.chartType'),

	toDisplayAttributes: function(){
		return (this.get('dataSourceId') && !(this.get('isPivotTableChart')));
	}.property('dataSourceId','isPivotTableChart'),

	single_value: function() {
		return this._parentView._parentView.chartType == 'single_value';
	}.property('_parentView._parentView.chartType'),
	
});


Cibi.ChartsNewView = Ember.View.extend({
	templateName: 'charts/new',

	removeChart: function() {
		var dataSourcesViews = this.get('dataSourcesView');
		dataSourcesViews.toArray().forEach(function(view) {
			dataSourcesViews.removeObject(view);
		})
		document.getElementById("new_chart").reset();
		$('.btn-group button').removeClass('active');
		this.set('chartType', null);
	},

	submit: function(e) {
		e.preventDefault();
		var title			   = this.get('title');
		var subtitle		   = this.get('subtitle');
		var chartType		   = this.get('chartType');
		var cssClassName	   = this.get('cssClassName')
		cssClassName 		   = cssClassName ? cssClassName : 'span';
		var width			   = this.get('width') || '800';
		var height			   = this.get('height') || '800';
		var marginTop		   = this.get('marginTop') || '40';
		var marginBottom	   = this.get('marginBottom') || '40';
		var marginRight		   = this.get('marginRight') || '40';
		var marginLeft		   = this.get('marginLeft') || '50';
		var secondaryDimension = this.get('secondaryDimension');
		var modalEnabled	   = this.get('modalEnabled');
		var configs			   = this.get('configs'); //{};
		var chartsDataSources  = this.get('chartsDataSources');
		var sort_by_key		   = this.get('sort_by_key');
		var desc_order		   = this.get('desc_order');
		// var orientationType	   = this.$('input[name="orientation_type"]:checked').val();
		
		var chartsDataSources = [];
		var dataSources = this.get('dataSourcesView').toArray();
		if(chartType == null) {
			var notice_elem = $("#new-chart-notice")
			notice_elem.html('Please select a chart type.');
			notice_elem.addClass('alert alert-error');
			notice_elem.fadeIn().delay(10000).fadeOut();
			return;
		}

		if(dataSources.length === 0) {
			var notice_elem = $("#new-chart-notice")
			notice_elem.html('Specify atleast 1 data source');
			notice_elem.addClass('alert alert-error');
			notice_elem.fadeIn().delay(10000).fadeOut();
			return;
		}

		if(chartType == "combo"){ 
			if(dataSources.length != 2) {
				var notice_elem = $("#new-chart-notice")
				notice_elem.html('Combination Chart Requires 2 Data Sources. Left Y Axis - diplays fact from one data source & Right Y Axis - displays fact from second data source');
				notice_elem.addClass('alert alert-error');
				notice_elem.fadeIn().delay(10000).fadeOut();
				return;
		    }
		}	
		for(var i = 0; i < dataSources.length; i++) {
			var dataSourceView = dataSources[i];
			var elem = dataSourceView.elementId;
			var cds = {};
			cds.data_source_id 		= dataSourceView.get('dataSourceId');
			cds.dimension_name 		= dataSourceView.get('dimensionName');
			cds.depth = dataSourceView.get('depth');
		    if(chartType == "multiline"){
		    	if(!cds.depth){
		    	    var notice_elem = $("#new-chart-notice")
				    notice_elem.html('To Create a Multiline Chart, Specify a depth field in Data Source. Else, try a lineChart instead!');
				    notice_elem.addClass('alert alert-error');
				    notice_elem.fadeIn().delay(10000).fadeOut();
				    return;	
		    	}
		    }
		    if(chartType == "pie"){
		    	if(cds.depth){
		    	    var notice_elem = $("#new-chart-notice")
				    notice_elem.html('Pie Chart shows how the fact field is distributed across dimension. Depth can not be specified in this chart type!');
				    notice_elem.addClass('alert alert-error');
				    notice_elem.fadeIn().delay(10000).fadeOut();
				    return;	
		    	}
		    }
		    if(chartType == "geo"){
		    var arr = [];
		    arr = dataSourceView.get('fieldsArr').join("`").toLowerCase().split("`");	
		      if(!arr.contains("lon") && !arr.contains("lat")){
		      	    var notice_elem = $("#new-chart-notice")
				    notice_elem.html('Data Source for a Geo chart must have valid LAT and LON fields');
				    notice_elem.addClass('alert alert-error');
				    notice_elem.fadeIn().delay(10000).fadeOut();
				    return;	
		      }


		    }

			if(!cds.dimension_name && chartType!="grouped_table" && chartType != "single_value") {
				var notice_elem = $("#new-chart-notice")
				notice_elem.html('Every Data Source Must have a dimension Specified');
				notice_elem.addClass('alert alert-error');
				notice_elem.fadeIn().delay(10000).fadeOut();
				return;
			}
			cds.dimension_format_as = dataSourceView.get('dimensionFormatAs');
			cds.depth 	   			= dataSourceView.get('depth');
			cds.fact 		   		= dataSourceView.get('fact'); 
			cds.fact_display 		   		= dataSourceView.get('factDisplay'); 
			cds.fact_format   		= dataSourceView.get('factFormat');
			cds.fact_type 	  		= dataSourceView.get('factType'); 
			cds.fact_unit 	  		= dataSourceView.get('factUnit'); 
			cds.count 		   		= dataSourceView.get('count'); 
			cds.is_calculated 		   		= dataSourceView.get('is_calculated'); 
			chartsDataSources.push(cds);
		}

		var c = {};
		c.title = title;
		c.subtitle = subtitle;
		c.chartType = chartType;
		c.configs = JSON.stringify(configs);
		c.cssClassName = cssClassName;
		c.width = width;
		c.height = height;
		c.marginBottom = marginBottom;
		c.marginRight = marginRight;
		c.marginLeft = marginLeft;
		c.marginTop = marginTop;
		c.sortByKey = (sort_by_key == 'on') ? true : false ;
		c.descOrder = desc_order;
		c.modalEnabled = modalEnabled;
		c.secondaryDimension = secondaryDimension;
		c.chartsDataSourcesStr = JSON.stringify(chartsDataSources);
		// c.orientationType = orientationType;
		var dashboard_charts_controller = this.get('controller');
		var dashboard = dashboard_charts_controller.get('controllers').get('dashboard').get('content');
		c.dashboard = dashboard;

		var data = {'chart' : c};
		var chart = Cibi.Chart.createRecord(c);
		chart.on('didCreate', function(e) {
			var dashboard_id = dashboard.get('id');
			var charts = Cibi.Chart.find({dashboard_id: dashboard_id}).then(function(charts) {
				dashboard_charts_controller.set('model', charts);
				dashboard_charts_controller.transitionToRoute('dashboard.charts', dashboard);
			});
		});
		chart.get('transaction').commit();

		$("#modal-new-chart").modal('toggle');
	},

	chartTypeView: Ember.View.extend({
		template: Ember.Handlebars.compile("{{partial 'charts/chartType'}}"),
		didInsertElement: function() {
			$("button").tooltip({
				placement: "bottom"
			});
		},

		click: function(e) {
			var elem = e.target;
			if(elem.nodeName.toLowerCase() === 'button') {
				this._parentView.set('chartType', elem.value);
			} else if ( elem.nodeName.toLowerCase() === "img") {
				this._parentView.set('chartType', elem.parentElement.value);
			}
		},
	}),

	chartTypeConfigsView: Ember.View.extend({
		template: Ember.Handlebars.compile("{{partial 'charts/chartTypeConfigs'}}"),
        colorPallette: function(){
			colors=["","Aqua","Blue","Brown","Gray","Green","Indigo","Orange","Pink","Purple","Red","Yellow"];
			return colors;
		}.property(''),

		pie: function() {
			return this._parentView.chartType == 'pie';
		}.property('_parentView.chartType'),

		bar: function() {
			return this._parentView.chartType == 'bar';
		}.property('_parentView.chartType'),

		ctree: function() {
			return this._parentView.chartType == 'ctree';
		}.property('_parentView.chartType'),

		ctable: function() {
			return this._parentView.chartType == 'ctable';
		}.property('_parentView.chartType'),

		geo: function() {
			return this._parentView.chartType == 'geo';
		}.property('_parentView.chartType'),

		combo: function() {
			return this._parentView.chartType == 'combo';
		}.property('_parentView.chartType'),

		table: function() {
			return this._parentView.chartType == 'table';
		}.property('_parentView.chartType'),
		
		multiline: function() {
			return this._parentView.chartType == 'multiline';
		}.property('_parentView.chartType'),

		line: function() {
			return this._parentView.chartType == 'line';
		}.property('_parentView.chartType'),

	    area: function() {
			return this._parentView.chartType == 'area';
		}.property('_parentView.chartType'),

	    stacked_area: function() {
			return this._parentView.chartType == 'stacked_area';
		}.property('_parentView.chartType'),

		hbar: function() {
			return this._parentView.chartType == 'hbar';
		}.property('_parentView.chartType'),

		grouped_table: function() {
			return this._parentView.chartType == 'grouped_table';
		}.property('_parentView.chartType'),

		single_value: function() {
			return this._parentView.chartType == 'single_value';
		}.property('_parentView.chartType'),

		configs: null,

		change: function(e) {

			var configs = this.get('configs');
			configs = configs ? configs : {};
			
			if(e.target.className.indexOf('arrayField') != -1) {
				configs[e.target.name] = e.target.value.split(',').map(function(s) {
					return s.trim();
				});
			} else {
				if(e.target.name == 'sort_by_key'){
					this._parentView.set('sort_by_key', e.target.value);
				}else{
					if(e.target.name == 'desc_order'){
						this._parentView.set('desc_order', e.target.value);
					}else{
						configs[e.target.name] = e.target.value;	
					}					
				}				
			}
			
			this.set('configs', configs);
			this._parentView.set('configs', configs);
		},

		geoChartTypeChanged: function(e) {
			var configs = this.get('configs');
			configs = configs ? configs : {};
			configs[event.toElement.name] = event.toElement.value;
			this.set('configs', configs);
			this._parentView.set('configs', configs);
		}
	}),

	chartsDataSourcesView: Ember.ContainerView.extend({
		viewName: 'dataSourcesView',
		childViews: [],
	}),

	addDataSourceView: Ember.View.extend({
		template: Ember.Handlebars.compile("<span class='alert alert-info'><i class='icon-plus muted'></i> Data Source </span>"),
		click: function() {
			var pv = this._parentView;
			var dsContainer = pv.get('dataSourcesView');
			dsContainer.pushObject(Cibi.NewChartsDataSourceView.create());
		},
	}),
});

