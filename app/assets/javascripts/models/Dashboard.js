	/**
@class Cibi.Dashboard
*/

/**
  `Cibi.Dashboard` is the `Dashboard` model

  A chart has following attributes: 

  `title, subtitle, displayName`

  In addition, a dashboard has following relationships:

  belongs_to vertical, 

  has_many charts
  
  @class Cibi.Dashboard
*/
Cibi.Dashboard = DS.Model.extend({
	title: DS.attr('string'),
	displayName: DS.attr('string'),
	subtitle: DS.attr('string'),
	rows: DS.attr('number'),
	columns: DS.attr('number'),
	updatedAt: DS.attr('date'),
	autoRefresh: DS.attr('boolean'),
	refreshInterval: DS.attr('number'),
	description: DS.attr('string'),
	vertical: DS.belongsTo('Cibi.Vertical'),
	charts: DS.hasMany('Cibi.Chart'),
	dashboardFilters: DS.hasMany('Cibi.DashboardFilter'),
	accountTemplate: DS.belongsTo('Cibi.AccountTemplate'),

	tabId: function() {
		return "dashboards_" + this.id;
	}.property('id'),

	currentVertical: function() {
		var v = this.get('vertical');
		if(v) {
			return v.get('id');	
		}
	}.property('vertical'),

	tabLink: function() {
		return "#dashboards_" + this.id;
	}.property('id'),

	drawAll: function(trigger_chart_id) {
		this.get('charts').forEach(function(chart) {
			if(!trigger_chart_id || trigger_chart_id !== chart.get('id')) {
				chart.draw();
			}			
		});
		var filterKeys = this.get('filterKeys') || [];
		if(filterKeys.length > 0){
			this.highlightFilters();
		}else{
			this.clearHighlights();
		}
	}.observes('charts'),

	// isReady: function() {
	// 	return this.get('ca').get('isSetup');
	// }.property('dataSource.isSetup'),

	isFiltered: function() {
		var charts = this.get('charts');
		return charts.filterProperty('filterOn', true).get('length');
	}.property('charts.@each.filterOn'),

	can_edit: function() {
		var isAdmin = Cibi.Auth.get('currentUser').get('isAdmin');
		if (isAdmin) {
			return isAdmin;
		}
		var role = Cibi.Auth.get('currentUser').get_role('Dashboard', this.get('id'));
		return role && ( role == 'admin' || role == 'manager' )
	}.property('Cibi.Auth.currentUser.isLoaded'),

	can_destroy: function() {
		var isAdmin = Cibi.Auth.get('currentUser').get('isAdmin');
		if (isAdmin) {
			return isAdmin;
		}
		var role = Cibi.Auth.get('currentUser').get_role('Dashboard', this.get('id'));
		return role &&  role == 'admin'
	}.property('Cibi.Auth.currentUser.isLoaded'),

	/*
	Returns an array of objects.
	example: [{"dimension" => "Branch Name", "value" => "Nagpur"},
	{"dimension" => "Date", "value" => "2013Q1"}]
	*/
	getAllFilters: function(){

		var charts = this.get('charts');
		var filters = [];
		if(this.get('chartFilterObj')) {
			_.each(this.get('chartFilterObj'),function(f){
				filters.push(f);
			});
		}else{ 
			charts.forEach(function(chart) {
				filter_values = {};
				if(chart.get('chartFilter')){
					filter_values['dimension'] = chart.get('chartsDataSources').objectAt(0).get('dimensionName');
					filter_values['formatAs'] =  chart.get('chartsDataSources').objectAt(0).get('dimensionFormatAs');
					filter_values['value'] = chart.get('chartFilter');
					filters.push(filter_values);
				}		  
			});
		}
		return filters;
	},

	chartsOnClickFilters: function(){
		var charts = this.get('charts');
		var filters = [];
		if(this.get('chartFilterObj')){
			_.each(this.get('chartFilterObj'),function(f){
				if(f.value instanceof Array){
					Ember.set(f, "value", f.value.uniq());
				}
				filters.push(f);
			});
		}
		return filters;
	}.property('chartFilterObj.length', 'chartFilterObj'),

	// allChartsLoaded:function(){
	// 	var obj = this;
	// 	var charts = obj.get('charts');
	// 	charts.forEach(function(chart){
	// 		if(chart.get('dataLoading') == false){
	// 			var flag = true;
	// 		}else{
	// 			flag = false;
	// 		}
	// 	});
	// 	return flag;
	// }.property('charts.@each.dataLoading'),

	isSetup: function() {
		var flag = true;
		var charts = this.get('charts');
	    charts.forEach(function(chart) {
	    	flag = flag && chart.get('isSetup');
	    });
	    return flag;
	}.property('charts.@each.isSetup'),

	// isChartLoaded: function(){
	// 	var obj = this;
	// 	var div = $('div.floatThead-container');
	// 	if(div.length != 0){
	// 		_.each(div,function(d){
	// 			$(d).css('position','absolute');
	// 		});
	// 	}
	// }.observes('allChartsLoaded'),

	dashboardFieldsArr: function() {
		if(this.get('isSetup') == true) {
			var obj = this;
			var datasource = {};		
			var charts = obj.get('charts');
				charts.forEach(function(c) {
					var chart_datasources = c.get('chartsDataSources');
					chart_datasources.forEach(function(cds) {
						var fieldArr = cds.get('dataSource').get('fieldsHash');
						_.each(fieldArr, function(field_obj) {
							datasource[field_obj["name"]] = field_obj["data_type"];
						});
					});
				});
			var arr = [];
			_.each(datasource, function(value, key) {
				arr.push({text: key, value: value});				
			});

			arr.sort(function(a, b){
            return a.text == b.text ? 0 : +(a.text > b.text) || -1;
             });

			this.set('filter_hash', arr)
			return [''].concat(arr);
		}else{
			return ['']
		}
	}.property('isSetup'),


	getChartHeight: function(grid_rows, chart_rows, has_legend,has_timetoggle) {
		// var dashboard = this;
		// var tH = $(window).height();		
		// var nR = grid_rows;
		var dC = 10;
		// var blockH = (tH - (nR - 1) * dC) / nR;
		var blockH=this.getBlockHeight(grid_rows);
		var top_space = 96;
		var legend_height = has_legend ? 0 : 51;
		var legend_height_adj = 50 * (chart_rows - 1);
		var timetoggle_height = has_timetoggle ? 41:0;
		return (blockH * chart_rows) + legend_height + legend_height_adj - top_space + ((chart_rows - 1) * dC) - timetoggle_height;

	},

	getChartWidth: function(grid_columns, chart_columns) {
		// var dashboard = this;
		// var tW = dashboard.get('totalWidth') - 30;
		// var nC = grid_columns;
		var dC = 10;
		// var blockW = (tW - (nC - 1) * dC) / nC;
		var blockW=this.getBlockWidth(grid_columns);
		return ((blockW * chart_columns) + ((chart_columns - 1) * dC) - 10);
	},

	getBlockWidth: function(grid_columns){
		var dashboard=this;
		var columns=grid_columns || dashboard.get('columns');
		var tW = dashboard.get('totalWidth') - 30;
		var nC = columns;
		var dC = 10;
		var blockW = (tW - (nC - 1) * dC) / nC;
		return blockW;
	},

	getBlockHeight: function(grid_rows){
		var dashboard = this;
		var rows= grid_rows || dashboard.get('rows');
		var tH = $(window).height();		
		var nR = rows;
		var dC = 10;
		var blockH = (tH - (nR - 1) * dC) / nR;
		return blockH;
	},

	/**
		It adds the class 'selected' to the current filter keys.


		@method highlightFilters
	*/

	highlightFilters: function() {
		var filterKeys = this.get('filterKeys');
		if(filterKeys && filterKeys.length > 0) {
			_.each(filterKeys, function(filterKey){
				var curr_class = $('[id="'+filterKey+'"]').attr('class');
				if(curr_class != undefined) {
					$('[id="'+filterKey+'"]').attr('class', curr_class + " selected");	
				} else {
					$('[id="'+filterKey+'"]').attr('class', "selected");	
				}
			});			
		}
	}.observes('filterKeys.length'),

	/**
		It removes the class 'selected' from the current filter keys.


		@method clearHighlights
	*/

	clearHighlights: function() {
		var filterKeys = this.get('filterKeys');
		if(filterKeys && filterKeys.length > 0) {
			_.each(filterKeys, function(filterKey){
				var curr_class = $('[id="'+filterKey+'"]').attr('class');
				if(curr_class != undefined && curr_class.indexOf("selected") !== -1) {
					$('[id="'+filterKey+'"]').attr('class', curr_class.replace(/(\s)*selected/, ""));
				}
			});			
		}
	},

	reset: function(filter, value, no_draw) {
		var chartFilterObj = this.get('chartFilterObj');
		if(!chartFilterObj) {
			return;
		}
		if(filter) {
			var index = chartFilterObj.indexOf(filter);
			if(index != -1){
				filter.value.removeObject(value);
				if(filter.value.length>0){
					chartFilterObj[index] = filter;
					this.notifyPropertyChange('chartFilterObj');
				}else{
					chartFilterObj.removeAt(index);
				}
				var filterKey = "chart-" + filter.chart_id + "-" + value;
				this.get('filterKeys').removeObject(filterKey);
			}
			// chartFilterObj.removeObject(filter);
			// var samechart = _.filter(chartFilterObj,function(cf){
			// 	if(cf.chart_id == filter.chart_id){
			// 		return cf.chart_id;
			// 	}
			// });
			
			if(this.get('filterKeys').length > 0){
				// var filterKey = "chart-" + samechart.objectAt(0).chart_id + "-" + samechart.objectAt(0).value;
				// var filterKeys = this.get('filterKeys') || [];
				// filterKeys.push(filterKey);
				// this.set('filterKeys',filterKeys);
				this.highlightFilters();
			}else{
				this.clearHighlights();
			}

		} else {
			// RESET ALL
			this.set('chartFilterObj', []);
			this.set('filterOn', false);
			this.set('filterKeys', null);
			// this.set('chartFilter', "");
		}
		
		// var cds = this.get('chartsDataSources');		
      	// cds.forEach(function(c) {
      		// c.reset();
      	// })

		if(no_draw) {
			return;
		}
  		if(!(chartFilterObj.length > 0))
  		{	
			this.set('filterOn', false);
			this.set('filterKeys', null);
			// this.set('chartFilter', "");
			this.drawAll();	
  		}
  		else{
			this.drawAll();
  		}
	},

});