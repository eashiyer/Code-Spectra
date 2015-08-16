Cibi.UsersController = Ember.ArrayController.extend({
	needs: 'permissions',

	update_user: function(user){
		user.transaction.commit();
	},

	delete_user: function(user){
		var r = confirm("Are you sure you want to delete this user?");
		if (r === true) {
			user.deleteRecord();
			var store = user.get('store');

			store.commit();
		}
	},
});