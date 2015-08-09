Cibi.VerticalUsersController = Ember.ArrayController.extend({
	needs: ['users', 'vertical', 'permissions'],

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
	}.property('controllers.permissions.length','controllers.users.length'),

	dashboards: function(){
		var vertical_controller = this.get('controllers').get('vertical');
		var vertical_id = vertical_controller.get('id');
		var vertical=vertical_controller.get('content');
		return vertical.get('dashboards');
	}.property('controllers.vertical.id'),
	
	create: function(params) {
		var obj = this;
		var currentUser=Cibi.Auth.get('currentUser');
		var vertical_controller = this.get('controllers').get('vertical');
		var vertical_id = vertical_controller.get('id');	
		var user = Cibi.User.find(params.user_id);
		var currentUserPermissions=currentUser.get('permissions');
		var isAdminForVertical=false;

		for(var i=0;i<currentUserPermissions.get('length');i++)
		{
			if(currentUserPermissions.objectAt(i).get('permissibleType')=="Vertical")
			{
				if(currentUserPermissions.objectAt(i).get('permissibleId')==vertical_id && currentUserPermissions.objectAt(i).get('role')=="admin")
				{
					isAdminForVertical=true;
				}					
			}
		}
		if(currentUser.get('isAdmin') || isAdminForVertical)
		{
			if(params.permissibleType=="Vertical")
			{
				var permission = Cibi.Permission.createRecord({
					user: user,
					role: params.role,
					permissibleId: vertical_id,
					permissibleType: "Vertical",

					didCreate: function() {
						  var vertical = vertical_controller.get('content');
						  var permissions_controller = obj.get('controllers').get('permissions');
						  permissions_controller.set('model', Cibi.Permission.find({vertical_id: vertical_id})) ;
						  permissions_controller.transitionToRoute('vertical.users', vertical);
					},
				});
				permission.get('transaction').commit();
			}
			else
			{
				for(var i=0;i<params.permissibleDashboards.get('length');i++)
				{	
					var dashboard_id=params.permissibleDashboards.objectAt(i);
					var permission = Cibi.Permission.createRecord({
						user: user,
						role: params.role,
						permissibleId: dashboard_id,
						permissibleType: "Dashboard",

						didCreate: function() {
							  var vertical = vertical_controller.get('content');
							  var permissions_controller = obj.get('controllers').get('permissions');
							  permissions_controller.set('model', Cibi.Permission.find({vertical_id: vertical_id})) ;
							  permissions_controller.transitionToRoute('vertical.users', vertical);
						},
					});
					permission.get('transaction').commit();
				}
			}
		}
		else
		{
			alert('Not Permissible');
		}		
	},

	can_edit: function() {
		var vertical_controller = this.get('controllers').get('vertical');
		return vertical_controller.get('can_edit');
	}.property('Cibi.Auth.currentUser.isLoaded', 'controllers.vertical.can_edit'),

	can_destroy: function() {
		var vertical_controller = this.get('controllers').get('vertical');
		return vertical_controller.get('can_destroy');
	}.property('Cibi.Auth.currentUser.isLoaded', 'controllers.vertical.can_destroy'),

});