Cibi.UserMgmtView = Ember.View.extend({
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
  			dbarColor = "background-color:"+dbarColor+";min-height:44px; max-height: 44px; padding-left:20px;";
  		}
  		return dbarColor;
  	}.property('Cibi.Auth.currentUser.isLoaded'),
});