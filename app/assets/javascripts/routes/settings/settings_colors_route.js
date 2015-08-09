Cibi.SettingsColorsRoute = Em.Route.extend({
	model: function (argument) {
		return Cibi.UserColorPreference.find(1);
	},

	renderTemplate: function() {
		this.render("settings/colors");
	},
});