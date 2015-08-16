Cibi.AccountSettingsRoute = Ember.Route.extend({
	model: function (params) {
		return Cibi.AccountSetting.find(params.account_id);
	},
});

