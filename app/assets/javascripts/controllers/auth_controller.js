Cibi.AuthController = Em.Controller.extend({
	login: function (params) {
		var obj = this;		
		Cibi.Auth.signIn({data: params});		
		Cibi.Auth.on('signInSuccess', function() {
			Cibi.Auth.set('signing_in', true);	
			Cibi.Auth.set('errorMessage', false);
			Cibi.Auth.set("infoMessage", "Signed In Successfully!");
			window.location.reload();
		});
		
		Cibi.Auth.on('signInError', function() {
			Cibi.Auth.set('signing_in', false);			
			Cibi.Auth.set("errorMessage", "Incorrect Password!");
		});
	}
});