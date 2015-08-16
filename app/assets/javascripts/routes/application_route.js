Cibi.ApplicationRoute = Ember.Route.extend({
	events: {
	    error: function(reason, transition) {
	       // alert(reason);
	    },
  	},

  	setupController: function(controller, model) {
  		if(Cibi.Auth.get('signedIn')) {
  			this.controllerFor('users').set('model', Cibi.User.find());	
        var currentUser = Cibi.User.find(Cibi.Auth.get('userId'))
        currentUser.then(function(user){
          //accountSetting = Cibi.AccountSetting.find({account_id: user.get('accountId'))
          accountSetting = Cibi.AccountSetting.find(0); //dirty hack to get current account_settings.           
          Cibi.Auth.set('globalSetting', accountSetting);  

            var currentAccount = user.get('account')
            Cibi.Auth.set('accountExpired', false);
            currentAccount.then(function(account){
              if(account.get('isLoaded')){
                time_limit = account.get('timeLimit')
                if(time_limit < new Date()){
                  Cibi.Auth.set('accountExpired', true);
                }
                var days_remaining = Math.round((time_limit-new Date())/(1000 * 60 * 60 * 24));
                Cibi.Auth.set('daysRemain',days_remaining);
                if(account.get('accountType') == "trial"){
                  Cibi.Auth.set('isTrial',true);
                }else{
                  Cibi.Auth.set('isTrial',false);
                }
              }
            });
                
        });
        Cibi.Auth.set('currentUser', currentUser);
        Cibi.Auth.set('colorPreference', Cibi.UserColorPreference.find(1));
        // Cibi.Auth.set('globalErrorMessage', false);
  		}
  	},
});


