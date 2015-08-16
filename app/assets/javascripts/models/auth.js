Cibi.Auth = Em.Auth.create({
	signInEndPoint: '/users/sign_in',
	signOutEndPoint: '/users/sign_out',
	
	tokenKey: 'auth_token',
	tokenIdKey: 'user_id',

	modules: ['emberData', 'urlAuthenticatable', 'authRedirectable', 'actionRedirectable', 'rememberable'],

	authRedirectable: {
		route: 'verticals'	
	},

	actionRedirectable: {
		signInSmart: true,
		signInBlacklist: ['sign-in'],
    	signOutRoute: 'verticals',	
	},

	rememberable: {
		tokenKey: 'remember_token',
		period: 7, 
		autoRecall: true,
	},

});