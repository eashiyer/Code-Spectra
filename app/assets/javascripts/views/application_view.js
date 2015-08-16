Cibi.ApplicationView = Ember.View.extend({
	log_out: function(event, view) {
		Cibi.Auth.signOut();
		Cibi.Auth.on('signOutSuccess', function() {
			delete localStorage.authToken;
			delete localStorage.email;
			delete localStorage.password;
      Cibi.Auth.set("accountExpired", false);
			Cibi.Auth.set("infoMessage", "Signed Out Successfully!");
		});
	},

	dismissGlobalError: function(){
		$('#myModal').addClass('hide');
		$('.modal-backdrop').addClass('hide');
	},

	logoUrl: function(){
		var current_user = Cibi.Auth.get('currentUser');
		if(current_user) {
			return current_user.get('get_company_logo_url')	
		}
		
	}.property('Cibi.Auth.currentUser.isLoaded'),

  logoDims: function(){
  		var current_user = Cibi.Auth.get('currentUser');
  		if(current_user) {
		  	var width = Cibi.Auth.get('currentUser').get('get_company_logo_width')
		  	var height = '50'
		  	return "width:"+width+"px;height:"+height+"px;"
  		}
  	}.property('Cibi.Auth.currentUser.isLoaded'),

  accountIconBarColor: function(){
    var current_user = Cibi.Auth.get('currentUser');
    if(current_user){
      var tbarColor = current_user.get('get_top_bar_color');
        if(current_user.get('topBarColor') != undefined){
          tbarColor = current_user.get('topBarColor');
        }
      tbarColor ="background-color:"+tbarColor+";height:58px; line-height:58px; box-shadow: 0 3px 1px black;";
      return tbarColor;
    }
  }.property('Cibi.Auth.currentUser.isLoaded'),

  getWorkspaceColor: function(){
    var current_user = Cibi.Auth.get('currentUser');
    if(current_user){
      return current_user.get('get_workspace_color');
    }
  }.property('Cibi.Auth.currentUser.isLoaded'),

  getDashboardColor: function(){
    var current_user = Cibi.Auth.get('currentUser');
    if(current_user){
      return current_user.get('get_dashboard_color');
    }
  }.property('Cibi.Auth.currentUser.isLoaded'),  

});

Cibi.DateField = Ember.TextField.extend({
  	attributeBindings: ['style', 'type', 'value', 'size'],
  	didInsertElement: function() {
   		return this.$().datepicker({
	    	autoclose: true
	    });
  	}
});

Cibi.NewTimeField = Ember.View.extend({
	templateName: 'date_time',
	attributeBindings: ['style', 'type', 'value', 'size'],
  	didInsertElement: function() {
  		var d=$("#"+this.elementId).attr("value");
  		if(d){
  			var formatDate=d3.time.format("%H:%M:%S");
  			$("#"+this.elementId).find(".datetimepicker").find("input").attr("value", formatDate(new Date(d)));
  		}  		
    	return this.$().datetimepicker({
    		format: 'hh:mm:ss',
    		pickDate: false,
    		autoclose: true
	    });
  	}
});

Cibi.NewDateField = Ember.View.extend({
	templateName: 'date_time',
	attributeBindings: ['style', 'type', 'value', 'size'],
  	didInsertElement: function() {
  		var d=$("#"+this.elementId).attr("value");
  		if(d){
  			var formatDate=d3.time.format("%m-%d-%Y");
  			$("#"+this.elementId).find(".datetimepicker").find("input").attr("value", formatDate(new Date(d)));
  		}
    	return this.$().datetimepicker({
    		format: 'MM-dd-yyyy',
    		pickTime: false,
    		autoclose: true
	    });
  	}
});

Cibi.NewDateTimeField = Ember.View.extend({
	templateName: 'date_time',
	attributeBindings: ['style', 'type', 'value', 'size'],
  	didInsertElement: function() {
  		var d=$("#"+this.elementId).attr("value");
  		if(d){
	  		var formatDate=d3.time.format("%m-%d-%Y %H:%M:%S");
	  		$("#"+this.elementId).find(".datetimepicker").find("input").attr("value", formatDate(new Date(d)));
	  	}
    	return this.$().datetimepicker({
    		format: 'MM-dd-yyyy hh:mm:ss',
    		autoclose: true
	    });
  	},
});


Cibi.NumberField = Ember.TextField.extend({
  type: 'number',
  attributeBindings: ['min', 'max', 'step', 'style']
});
