Cibi.VerticalUsersRoute = Ember.Route.extend({
	model: function () {
		var vertical_controller = this.controllerFor("vertical");
		if(vertical_controller) {
			var vertical = vertical_controller.get("content");
			if(vertical) {
				return vertical;
			}
		}
	},

	setupController: function(controller, model) {
		var vertical_id = this.controllerFor("vertical").get('content').id;
		this.controllerFor('permissions').set('model', Cibi.Permission.find({vertical_id: vertical_id}));
	},
});
