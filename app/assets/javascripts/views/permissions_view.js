Cibi.PermissionsView = Ember.View.extend({
	save: function() {
		alert('PermissionsView');
	},

	cancel: function() {
		this.set('addNew', false);
	},

	addNew: function() {
		this.set('addNew', true);
	},

});