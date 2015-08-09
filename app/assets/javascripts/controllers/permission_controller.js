Cibi.PermissionController = Em.ObjectController.extend({
	needs: ['vertical'],

	can_destroy: function() {
		var permission_user_id = this.get('user').get('id');
		if(permission_user_id == Cibi.Auth.get('userId')) {
			return false;
		}
		var vertical_controller = this.get('controllers').get('vertical');
		return vertical_controller.get('can_destroy');
	}.property('Cibi.Auth.currentUser.isLoaded', 'controllers.vertical.can_edit'),

});