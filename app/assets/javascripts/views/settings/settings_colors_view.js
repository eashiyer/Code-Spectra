Cibi.SettingsColorsView = Em.View.extend({
	submit: function (e) {
		e.preventDefault();
		this.get('controller').send('save');
	},
});	