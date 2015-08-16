Cibi.SettingsUserController = Em.ObjectController.extend({
	email: function () {
		var currentUser = Cibi.Auth.get('currentUser');
		return currentUser.get('email');
	}.property('Cibi.Auth.currentUser'),
});