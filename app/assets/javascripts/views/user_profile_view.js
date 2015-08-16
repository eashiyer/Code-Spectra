Cibi.UserProfileView = Ember.View.extend({
	currentUser:function(){
		return Cibi.Auth.get('currentUser');
	}.property(''),

	userName:function(){
		return this.get('currentUser').get('fullName');
	}.property('currentUser'),

	userEmail:function(){
		return this.get('currentUser').get('email');
	}.property('currentUser'),

	userAccountName:function(){
		return this.get('currentUser').get('account').get('name');
	}.property('Cibi.Auth.currentUser.account.isLoaded'),

	userApiAccessToken: function(){
		return this.get('currentUser').get('apiAccessToken');
	}.property('currentUser'),

	userHasApiAccess: function(){
		return this.get('currentUser').get('hasApiAccess');
	}.property('currentUser'),

	getDashboardColor: function(){
    	var current_user = Cibi.Auth.get('currentUser');
    	if(current_user){
      		return current_user.get('get_dashboard_color');
    	}
  	}.property('Cibi.Auth.currentUser.isLoaded'),

  	accountTopNavColor: function(){
  		var currentUser = Cibi.Auth.get('currentUser');
  		var dbarColor = this.get('getDashboardColor');
  	  	if(dbarColor != undefined){
  	  		if(currentUser.get('dashboardBarColor') != undefined){
  				dbarColor = currentUser.get('dashboardBarColor');
  			}
  	  		dbarColor = "background-color:"+dbarColor+";min-height:44px; max-height: 44px; padding-left:25px;";  	  		
  	  	}
  	  	return dbarColor;
  	}.property('Cibi.Auth.currentUser.isLoaded'),

	submit:function(e){
		e.preventDefault();
		var obj=this;
		// obj.set('errors',null);
		// obj.set('info',null);
		var password=$(e.target).find("#inputPassword").val();
		var confirmPassword=$(e.target).find("#inputConfirmPassword").val();
		var account = Cibi.Account.find(obj.get('currentUser').get('account').get('id'));
		
		if(this.get("userAccountName") != account.get("name")){
			account.set('name',this.get('userAccountName'));
			account.on('becameInvalid',function(errors){
				obj.set('errors',errors.errors.updated_name);
				obj.set('information',null);
			});
			account.on('didUpdate',function(){
				obj.set('information','AccountName updated successfully!');
				obj.set('errors',null);
			});
			account.get('transaction').commit();
		}

		if(password){
			if(password==confirmPassword)
			{
				var u = Cibi.User.find(obj.get('currentUser').get('id'));
				u.set('password',password);
				u.set('passwordConfirmation',confirmPassword);			

				u.on('becameInvalid',function(errors){
					// this.transaction.rollback();
					obj.set('errors',errors.errors.password);
					obj.set('info',null);
				});

				u.on('didUpdate',function(user){
					obj.set('info','Password updated successfully!');
					obj.set('errors',null);
				});
				// u.save();
				u.get('transaction').commit();
			}
			else
			{
				obj.set('errors','Passwords do not match');
				obj.set('info',null);
			}
		}
	},
});