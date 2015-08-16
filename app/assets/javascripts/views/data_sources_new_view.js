Cibi.DataSourcesNewView = Ember.View.extend({
	submit: function(e) {
		if(e.target.id != 'new-data-source-form') {
			return;
		}
		// Create new Data Source & Data Content		
		e.preventDefault();
		var obj = this;
		var elem = $("#new-data-source-name");
		var name = elem.val();
		var typeElem = $("#new-data-source-type .active");
		if(typeElem.length === 0) {
			$("#new-data-source-notice").html("<h4 class='alert alert-error'>Specify Data Source Type</h4>");
			return;
		// } else {
		// 	$("#new-data-source-notice").html("<h4 class='alert alert-success'>Created New Data Source!</h4>");
		}
		var dsType = typeElem.val()

		var ds = {};
		ds.name = name;
		ds.dataSourceType = dsType;
		ds.accountId = Cibi.Auth.get('currentUser').get('account').get('id');

		// var data = {'data_source': ds}
		var dataSource = Cibi.DataSource.createRecord(ds);
		dataSource.on('didCreate', function(ds) {
			obj.set('successMessage', 'Created New Data Source!');
			obj.get('controller').transitionToRoute('data_source', ds);
			// alert('new data source created!' + ds.get('id'));
			// Cibi.DataSource.find();	
		});
		dataSource.on('becameInvalid', function(errors) {
	  		// # record was invalid
	  		this.transaction.rollback();
		    obj.set('errorMessage',errors.errors.name);
  		});
		dataSource.get('transaction').commit();
        document.getElementById("new-data-source-form").reset();
        $('.btn-group button').removeClass('active');
	},

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
  			dbarColor = "background-color:"+dbarColor+";min-height:44px; display:visible; padding-left:15px; padding-right:15px;";
  		}
  		return dbarColor;
  	}.property('Cibi.Auth.currentUser.isLoaded'),
});