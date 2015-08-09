Cibi.AccountSettingsView = Ember.View.extend({
	changeDashboardColor: function(){
    	var current_user = Cibi.Auth.get('currentUser');
    	if(current_user){
      		return current_user.get('get_dashboard_color');
    	}
  	}.property('Cibi.Auth.currentUser.isLoaded', 'Cibi.Auth.currentUser.get_dashboard_color'),

  	accountTopNavColor:function(){
  	  	var current_user = Cibi.Auth.get('currentUser');
  	  	var asettingsBarColor = this.get('changeDashboardColor');
  	  	if(asettingsBarColor != undefined){
  	  		asettingsBarColor = "background-color:"+asettingsBarColor+";min-height:44px; max-height: 44px; padding-left:20px;";  	  		
  	  	}
  	  	return asettingsBarColor;
  	}.property('Cibi.Auth.currentUser.isLoaded', 'changeDashboardColor'),
});