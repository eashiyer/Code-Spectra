Cibi.VerticalEditRoute = Ember.Route.extend({
	model: function (params) {
		return Cibi.Vertical.find(params.vertical_id);
	},

	// setupController: function(controller, model) {
	// 	var vertical_id = this.controllerFor("vertical").get('content').id;
	// 	this.controllerFor('permissions').set('model', Cibi.Permission.find({vertical_id: vertical_id}));
	// },	
});