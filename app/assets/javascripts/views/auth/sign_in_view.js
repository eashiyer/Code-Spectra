Cibi.AuthSignInView = Em.View.extend({
	templateName: 'auth/sign_in',
	email: null,
	password: null,
	remember: false,

	submit: function (event, view) {
		event.preventDefault();
		event.stopPropagation();
		// Always set remember = true
		var params = {email: this.get('email'), password: this.get('password'), remember: true};
		this.get('controller').send('login', params);
	},

	showFreeTrialForm: function() {
		$("#modal-new-account").modal();
	},

	freeTrialView: Em.View.extend({
		templateName: 'auth/free_trial',

		createAccount:function(){
			var obj=this;
			var d = {};
			d.accountName=$("#inputAccountName").val();
			d.firstName=$("#inputFirstName").val();
			d.lastName=$("#inputLastName").val();		
			d.email=$("#inputEmail").val();
			
			var url="/accounts/create_account";

			req = $.ajax({
		            url: url,
		            type: 'post',
		            data: {'data': d},
		            async: false,
		            success: function(req, msg) {
		            	$("#modal-new-account").modal('toggle');
		            	alert(req.message);
		            },
		            error: function(req, msg, err) {
		                $("#modal-new-account").modal('toggle');
		            }
		    });	
		},
	}),
});