Cibi.ResetPasswordView = Em.View.extend({
	templateName: 'auth/reset_password',
	password: null,
    password_confirmation: null,

    didInsertElement: function(){
        Cibi.Auth.set('errorMessage', false);
        Cibi.Auth.set('infoMessage', false);
    },

	submit: function (event, view) {
		event.preventDefault();
		event.stopPropagation();
		// Always set remember = true
        var reset_password_token = this.get('controller').get('reset_password_token')
		var password = this.get('password');
        var password_confirmation = this.get('password_confirmation');
		var url = '/users/password'; 
        req = $.ajax({
            url: url,
            type: 'put',
            data: {'user[password]': password, 'user[password_confirmation]': password_confirmation, 'user[reset_password_token]': reset_password_token},
            async: false,
            success: function(response) {
                Cibi.Auth.set('infoMessage', 'Password reset sucessfully.')
                $("#reset_cancel").click();
            },
            error: function(req, msg, err) {	
                 Cibi.Auth.set('errorMessage', 'Password '+req.responseJSON['password'][0])
            },
            complete: function() {

            }
        });
	},
});