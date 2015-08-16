Cibi.DashboardsRoute = Cibi.AuthorizedRoute.extend({
	model: function(params) {
		return Cibi.Dashboard.find({vertical_id: params.vertical_id});
	}
});