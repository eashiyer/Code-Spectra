Cibi.VerticalNewRoute = Ember.Route.extend({
	model: function (params) {
		return Cibi.Vertical.find(params.vertical_id);
	},
});

