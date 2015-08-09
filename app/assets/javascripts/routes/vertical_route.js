Cibi.VerticalRoute = Cibi.AuthorizedRoute.extend({
	events: {
		willTransition: function() {
		},    
	},

	model: function(params) {
		return Cibi.Vertical.find(params.vertical_id);
	},

	afterModel: function(vertical, transition) {
		if(transition.providedModels.vertical !== undefined 
			&& transition.targetName !== 'vertical.new'
			&& transition.targetName !== 'vertical.users'
			&& transition.targetName !== 'vertical.edit'
			) {
			var first_dashboard = vertical.get('dashboards.firstObject');
			if(typeof first_dashboard !== "undefined") {
				this.transitionTo('dashboard.charts', first_dashboard);
			}
		}
	},

});


