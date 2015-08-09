Cibi.PermissionView = Ember.View.extend({
	roles: ['admin', 'manager', 'basic'],

	edit: function (permission) {
		this.set('editing', true);
	},

	delete: function(permission) {
		var r = confirm("Are you sure you want to remove this user from authorized users list?");
		if(r == true) {
			var obj = this;
			permission.deleteRecord();
			var id = permission.get('id');
			var permissions_view = obj.get('parentView').get('parentView');
			var permissions_controller = permissions_view.get('controller');
			var controller=obj.get('parentView').get('controller');

			permission.on('didDelete', function(d) {
				var vertical = permissions_controller.get('controllers').get('vertical').get('content');
				controller.set('model', Cibi.Permission.find({vertical_id: vertical.get('id')})) ;
				// permissions_view.rerender();
				// permissions_view.get('controller').transitionToRoute('vertical.users', vertical);
			});			
			permission.get('transaction').commit();			
		}
	},

	save: function(permission) {
		var obj = this;
		permission.on("didUpdate", function(e) {
			obj.set('editing', false);	
			obj.rerender();
		});
		permission.get('transaction').commit();
	}

});