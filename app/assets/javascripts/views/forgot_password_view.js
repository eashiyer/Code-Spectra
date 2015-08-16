Cibi.ForgotPasswordView = Em.View.extend({
	templateName: 'auth/forgot_password',
	email: null,

    didInsertElement: function(){
        Cibi.Auth.set('errorMessage', false);
        Cibi.Auth.set('infoMessage', false);
    },

	submit: function (event, view) {
		event.preventDefault();
		event.stopPropagation();
		// Always set remember = true
		var email = this.get('email');
		var url = '/users/password'; 
        req = $.ajax({
            url: url,
            type: 'post',
            data: {'user[email]': email},
            async: false,
            success: function(response) {
                Cibi.Auth.set('infoMessage', 'An email with password reset instructions is sent to you.')
            	$("#forgot_cancel").click();
                //document.location.hash = 'verticals'
            },
            error: function(req, msg, err) {	
                Cibi.Auth.set('errorMessage', 'Email address '+req.responseJSON['email'][0])
            },
            complete: function() {
            }
        });
	},
});