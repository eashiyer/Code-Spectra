Cibi.AuthorizedRoute = Em.Route.extend(Cibi.Auth.AuthRedirectable, {
	beforeModel: function(transition) {
		var obj = this;
		if (!Cibi.Auth.get('signedIn')){			
			if($.QueryString["sso_token"] && $.QueryString["client_id"]) {
				Cibi.Auth.signIn({data: {sso_token: $.QueryString["sso_token"], client_id: $.QueryString["client_id"], remember: true}});
				Cibi.Auth.on('signInSuccess', function() {
					Cibi.Auth.set('signing_in', true);	
					Cibi.Auth.set('errorMessage', false);
					Cibi.Auth.set("infoMessage", "Signed In Successfully!");
					var reload_url = window.location.origin + window.location.pathname+ window.location.hash;
					window.location = reload_url;
				});				
				Cibi.Auth.on('signInError', function(){
					obj.transitionTo("invalid_token");
				});
			} else if($.QueryString["backend_secret_token"]){
				Cibi.Auth.signIn({data: {backend_secret_token: $.QueryString["backend_secret_token"], remember: true}});
				Cibi.Auth.on('signInSuccess', function() {
					Cibi.Auth.set('signing_in', true);	
					Cibi.Auth.set('errorMessage', false);
					Cibi.Auth.set("infoMessage", "Signed In Successfully!");					
					window.location = '/';
				});	
			}
			Cibi.Auth.set('attemptedTransition', transition);
			if(transition.targetName != "verticals.index"){
				Cibi.Auth.set('errorMessage', 'Please Sign in!');
			}
			obj.transitionTo('verticals');
		}
	},

	error: function(reason, transition){
		alert(reason);
		console.log(reason);
		console.log("$%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
	},

	actions: {
	    error: function(reason, transition) {
	       alert(reason);
         console.log(reason);
         console.log("################################################");
	    },
  	},

});
