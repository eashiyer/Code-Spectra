Cibi.SettingsColorsController = Em.ObjectController.extend({

	selectTheme: function(palette) {
		this.get('content').set('colorTheme', palette);
	},

	save: function() {
		var currentUser = Cibi.Auth.get('currentUser');
		var preference = this.get('content');
		if(!preference) {
			preference = Cibi.UserColorPreference.createRecord();
		}
		preference.set('colorTheme', this.get('colorTheme'));
		preference.set('bar', this.get('bar'));
		preference.set('line', this.get('line'));
		preference.set('area', this.get('area'));
		preference.set('errorBar', this.get('errorBar'));
		preference.set('statisticalRelevance', this.get('statisticalRelevance'));
		preference.set('controlKey', this.get('controlKey'));
		preference.set('user', currentUser);
		preference.on('didSave', function() {
			Cibi.Auth.set('colorPreference', preference);
		});
		preference.get('store').commit();
	}

});