Cibi.DashboardRoute = Cibi.AuthorizedRoute.extend({
	model: function (params) {
		return Cibi.Dashboard.find(params.dashboard_id);
	},
});
	



