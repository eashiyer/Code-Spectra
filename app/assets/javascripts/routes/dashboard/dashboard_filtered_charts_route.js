Cibi.DashboardFilteredChartsRoute = Cibi.AuthorizedRoute.extend({
	model: function(params) {
		var dashboard = this.modelFor('dashboard');
		if(dashboard) {
			var dashboard_id = dashboard.get('id');
			if(dashboard_id) {
				return Cibi.Chart.find({dashboard_id: dashboard_id});

			}	
		}
	},

	afterModel: function(charts, transition) {
		var dashboard = this.modelFor('dashboard');
		if(dashboard) {
			var filter_str = transition.params.filter;
			dashboard.set('showDashboardFilters', true);
			dashboard.set('drawCharts', true);
			if(filter_str){
				var filter_json = decodeURIComponent(filter_str);
				var filters = JSON.parse(filter_json);
				var chartFilterObj = [];
				if(filters.length > 1){
					for(var i=0;i<filters.length;i++){
						chartFilterObj.addObject(filters[i]);
					}	
				}else{
					chartFilterObj.addObject(filters);
				}
				dashboard.set('chartFilterObj',chartFilterObj);
				dashboard.drawAll();
			}
			if(dashboard.get('autoRefresh') && dashboard.get('refreshInterval')){
				var interval=setInterval(function(){ 
				    dashboard.drawAll();    
				}, (dashboard.get('refreshInterval')*1000));
				Cibi.Auth.set('dashboardInterval', interval);	
			}
		}		
	},

	renderTemplate: function() {
		this.render('charts');
	}
});
