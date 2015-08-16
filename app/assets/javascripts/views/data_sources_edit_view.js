Cibi.DataSourcesEditView = Ember.View.extend({
	submit: function(e) {
		e.preventDefault();
		var obj = this;
		var ds = this.get("controller").get('content');
		ds.set('name',$('#new-data-source-name').val());
		ds.set('loadCount',$('#count').val());
		ds.set('enabled',$('#enabled').is(":checked"));
		ds.set('accountId', Cibi.Auth.get('currentUser').get('account').get('id'));
		ds.on('didUpdate', function(ds) {
         	//$("#new-data-source-notice").html("<h4 class='text-success'></h4>");
         	obj.set('noticeMessage', "Data Source updated!")
         	setTimeout(function() {
 				obj.set('noticeMessage', null);
 			}, 3000);
		});
		ds.get('transaction').commit();
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
  			dbarColor = "background-color:"+dbarColor+";min-height:44px; display:visible;";
  		}
  		return dbarColor;
  	}.property('Cibi.Auth.currentUser.isLoaded'),
});
