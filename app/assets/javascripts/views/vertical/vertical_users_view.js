Cibi.VerticalUsersView = Ember.View.extend({

	didInsertElement: function(){
		this.set('entityType',true);
		$("#createDashHead").addClass('hidden');
	},

	willClearRender: function(){
    	$("#createDashHead").removeClass('hidden');
  	},

	save: function() {
		var obj = this;
		var user_id = this.get('user');
		
		var role = this.get('role');
		var permissibleType;
		var permissibleDashboards=[];
		if(this.get('entityType'))
		{
			permissibleType="Vertical";	
		}
		else
		{			
			permissibleType="Dashboard";
			$(this.$('input:checkbox:checked')).each(function(){
  				permissibleDashboards.push($(this).attr('name'));
			});
		}
		this.get('controller').send('create', {user_id: user_id, role: role, permissibleType:permissibleType, permissibleDashboards:permissibleDashboards});
		$("#modal-new-permission").modal('toggle');			
	},

	name: function(){
		return this.get('parentView').get('controller').get('content').get('name');
	}.property(''),

	cancel: function() {
		$("#modal-new-permission").modal('toggle');
	},

	addNew: function() {
		$("#modal-new-permission").modal();
	},

	roles: function() {
		return ['admin', 'manager', 'basic'];
	}.property(),


});