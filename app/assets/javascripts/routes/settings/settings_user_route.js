Cibi.SettingsUserRoute = Cibi.AuthorizedRoute.extend({
	model: function (params) {
		return Cibi.Auth.get('currentUser');
	},

	setupController: function(controller, model) {
		this._super();
		controller.set('model', model);
	},

});
