Cibi.DashboardEditChartRoute = Cibi.AuthorizedRoute.extend({
	beforeModel: function(transition) {
		$("body").scrollTop(0);
	},

	model: function(params) {
		var dashboard = this.modelFor('dashboard');
		var chart_id = params.chart_id;
		if(chart_id) {
			return Cibi.Chart.find(chart_id);	
		}
	},

	afterModel: function(chart, transition) {
			chart.checkSetup();
	},
});