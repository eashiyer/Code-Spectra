Cibi.DashboardUsersController = Ember.ArrayController.extend({
	needs: ['users', 'dashboard', 'permissions'],

	users: function() {
		var users_controller = this.get('controllers').get('users');
		var permissions_controller = this.get('controllers').get('permissions');

		var users = users_controller.get('content');
		var permissions = permissions_controller.get('content');
		var authorized_users = permissions.map(function(d) { 
			var user = d.get('user');
			if(user && !user.get('isDeleted')) {
				return user.get('id');	
			}
		});
		authorized_users = authorized_users.filter(function(d) {
			return d;
		});
		var remaining_users = users.filter(function(d) {
			return authorized_users.indexOf(d.get('id')) == -1;
		});
		return remaining_users;
	}.property('controllers.permissions.length'),


	create: function(params) {
		var obj = this;
		var dashboard_controller = this.get('controllers').get('dashboard');
		var dashboard_id = dashboard_controller.get('id');

		var user = Cibi.User.find(params.user_id);
		var permission = Cibi.Permission.createRecord({
			user: user,
			role: params.role,
			permissibleId: dashboard_id,
			permissibleType: "Dashboard",

			didCreate: function() {
				var dashboard = dashboard_controller.get('content');
				var permissions_controller = obj.get('controllers').get('permissions');
				permissions_controller.set('model', Cibi.Permission.find({dashboard_id: dashboard_id})) ;
				permissions_controller.transitionToRoute('dashboard.users', dashboard);
			},
		});
		permission.get('transaction').commit();
	},

	can_edit: function() {
		var dashboard_controller = this.get('controllers').get('dashboard');
		return dashboard_controller.get('can_edit');
	}.property('Cibi.Auth.currentUser.isLoaded', 'controllers.dashboard.can_edit'),

	can_destroy: function() {
		var dashboard_controller = this.get('controllers').get('dashboard');
		return dashboard_controller.get('can_destroy');
	}.property('Cibi.Auth.currentUser.isLoaded', 'controllers.dashboard.can_destroy'),

})