Cibi.Router.map(function() {
	this.resource('verticals', function() {
		this.route('new');
		this.resource('vertical', { path : ':vertical_id' }, function() {
			this.resource('dashboard', { path : ':dashboard_id' }, function() {
				this.route('new');
				this.route('edit');
				this.route('filtered_charts',{path: 'charts/:filter'});
				this.route('charts');
				this.route('users');
				this.route('edit_chart', { path : 'edit_chart/:chart_id' });	
			});
			this.route('new');
			this.route('users');	
			this.route('edit');	
		});		
		
	});

	this.resource('data_sources', function() {
			this.resource('data_source', { path : ':data_source_id' });
			this.route('new');
			this.route('edit', { path: ':data_source_id/edit' });
	});


	// this.resource('account_setting', function(){
	// 	this.route('account_setting', { path : ':account_id' });
	// 	this.route('account_templates', { path : ':account_id/templates' });
	// });

	// this.resource('account_settings', { path : 'account_settings/:account_id' }, function(){
	// 	this.route('account_setting', {path:'/settings'});
	// 	this.route('account_template', {path: '/templates'});
	// });	

	this.resource('account_settings', { path : 'account_settings/:account_id' }, function(){
		this.route('account_templates', {path: '/templates'});
	});

	this.resource('user_mgmt', function() {
		this.route('index');
		this.route('user', {path: ':user_id'});
	});

	this.route('user_profile');
	this.resource('settings', function() {
		this.route('user');	
		this.route('colors');	
	});
	this.route('forgot_password');
	this.route('invalid_token');
	this.route('reset_password', {path: 'reset_password/:reset_password_token'});
});

Cibi.IndexRoute = Ember.Route.extend({
  redirect: function() {
  	if(this.router.location.location.pathname != "/jasmine") {
  		this.transitionTo('verticals');	
  	}
  }
});
