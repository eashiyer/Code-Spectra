Cibi.AuthSignOutView = Em.View.create({
	templateName: 'auth/sign_out',
	
	submit: function(event, view) {
		event.preventDefault();
		event.stopPropagation();
		Cibi.Auth.signOut();
		Cibi.Auth.on('signOutSuccess', function() {
			delete localStorage.authToken;
			delete localStorage.email;
			delete localStorage.password;
			Cibi.Auth.set("infoMessage", "Signed Out Successfully!");
		});
	},
});