Cibi.UsersNewView = Ember.View.extend({
	templateName: 'users/new',

	submit:function(e){
		e.preventDefault();
		var obj=this;
		var email=$(e.target).find("#inputEmail").val();
		var firstName=$(e.target).find("#inputFirstName").val();
		var lastName=$(e.target).find("#inputLastName").val();
		var isAdmin=$(e.target).find("#checkIsAdmin").is(':checked');
		var hasApiAccess=$(e.target).find("#checkHasAPIAccess").is(':checked');
		var u = {};
		u.email=email;
		u.firstName=firstName;
		u.lastName=lastName;
		u.isAdmin=isAdmin;
		u.hasApiAccess=hasApiAccess;
		u.accountId=Cibi.Auth.get('currentUser').get('account').get('id');

		var data = {'user' : u};
		var user = Cibi.User.createRecord(u);
		user.set('account', Cibi.Auth.get('currentUser').get('account'));
		
		user.on('becameInvalid', function(errors) {
	  		// # record was invalid
	  		this.transaction.rollback();
		    obj.set('noticeMessage',errors.errors.name);
  		});

		user.get('transaction').commit();

		$("#modal-new-user").modal('toggle');
	},
});
