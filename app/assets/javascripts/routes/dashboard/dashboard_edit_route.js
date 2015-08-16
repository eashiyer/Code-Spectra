Cibi.DashboardEditRoute = Cibi.AuthorizedRoute.extend({
	model: function(params) {
		var dashboard = this.modelFor('dashboard');
		if(dashboard) {
			dashboard.set('showDashboardFilters', false);
			var dashboard_id = dashboard.get('id');
			if(dashboard_id) {
				return Cibi.Dashboard.find(dashboard_id);	
			}

		}
	},


});