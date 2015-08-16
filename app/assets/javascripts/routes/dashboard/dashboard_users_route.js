Cibi.DashboardUsersRoute = Cibi.AuthorizedRoute.extend({
	model: function () {
		var dashboard_controller = this.controllerFor("dashboard");
		if(dashboard_controller) {
			var dashboard = dashboard_controller.get("content");
			if(dashboard) {
				return dashboard;
			}
		}
	},

	setupController: function(controller, model) {
		var dashboard=this.controllerFor("dashboard").get('content');
		if(typeof dashboard !=="undefined")
		{
			var dashboard_id = dashboard.id;
			this.controllerFor('permissions').set('model', Cibi.Permission.find({dashboard_id: dashboard_id}));
		}
		
	},
	
});

