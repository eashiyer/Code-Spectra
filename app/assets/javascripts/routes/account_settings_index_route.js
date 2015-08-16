Cibi.AccountSettingsIndexRoute = Ember.Route.extend({
	model: function (params) {
		return this.controllerFor('account_settings').get('content');
	},
});