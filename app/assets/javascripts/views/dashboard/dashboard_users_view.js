Cibi.DashboardUsersView = Em.View.extend({
	save: function() {
		var obj = this;
		var user_id = this.get('user');
		
		var role = this.get('role');
		this.get('controller').send('create', {user_id: user_id, role: role});
		obj.set('showCreateForm', false);			
		obj.rerender();
	},

	cancel: function() {
		this.set('showCreateForm', false);
	},

	addNew: function() {
		if(this.get('showCreateForm')) {
			this.set('showCreateForm', false);		
		} else {
			this.set('showCreateForm', true);	
		}
	},

	roles: function() {
		return ['admin', 'manager', 'basic'];
	}.property(),


});