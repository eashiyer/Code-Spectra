Cibi.DashboardNewRoute = Cibi.AuthorizedRoute.extend({	
	model: function(params) {
		var dashboard = this.modelFor('dashboard');
		if(dashboard) {
			return dashboard;
		}
	}

});