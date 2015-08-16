Cibi.VerticalView = Ember.View.extend({
	didInsertElement: function (argument) {
		if($("#dashboard_list > li").size==0)
		{
			$("#main-tab").html("No Dashboards Have Been Created For This Vertical.");
		}

		$(".auth-users").tooltip({
			title: "Vertical Users",
			placement: "bottom",
		});

		$(".new-dashboard").tooltip({
			title: "Add New Dashboard",
			placement: "bottom",
		});

		  // Fix input element click problem
		$("#dashboard_input").click(function(e) {
			e.stopPropagation();
		});

		$("#dashboard_input").fastLiveFilter("#dashboard_list");

		$(".dropdown-menu ul").change(function(e){
			e.stopPropagation();
		});		
	},

	getDashboardColor: function(){
    	var current_user = Cibi.Auth.get('currentUser');
    	if(current_user){
      		return current_user.get('get_dashboard_color');
    	}
  	}.property('Cibi.Auth.currentUser.isLoaded'),

	accountTopNavColor: function(){
		var currentUser = Cibi.Auth.get('currentUser');
		var dbarColor = this.get('getDashboardColor')
		if(dbarColor != undefined){
			if(currentUser.get('dashboardBarColor') != undefined){
				dbarColor = currentUser.get('dashboardBarColor');
			}
			dbarColor = "background-color:"+dbarColor+";";
		}
		return dbarColor;
	}.property('Cibi.Auth.currentUser.isLoaded'),

	accountDBdropColor:function(){
		var currentUser = Cibi.Auth.get('currentUser');
		var dbarColor = this.get('getDashboardColor')
		if(dbarColor != undefined){
			if(currentUser.get('dashboardBarColor') != undefined){
				dbarColor = currentUser.get('dashboardBarColor');
			}
			dbarColor = "background-color:"+d3.rgb(dbarColor).darker()+";margin-top:9px; margin-left:4px;";
		}
		return dbarColor;
	}.property('Cibi.Auth.currentUser.isLoaded'),
	accountTopNavPillsColor: function(){
		var elem=$("#"+this.elementId);
		var currentUser = Cibi.Auth.get('currentUser');
		var dbarColor = this.get('getDashboardColor');
		if(dbarColor != undefined){
			if(currentUser.get('dashboardBarColor') != undefined){
				dbarColor = currentUser.get('dashboardBarColor');
			}
			var dbColor = d3.rgb(dbarColor).darker().toString();
			elem.find(".dashboards").find("ul.nav").find("li").find("a.active").css("background-color", dbColor);	
		}
	}.observes('Cibi.Auth.currentUser.isLoaded','Cibi.Auth.globalSetting.isLoaded'),

	click: function(e){
		$("#dashboard_input").click(function(e) {
			e.stopPropagation();
		});
		$("#dashboard_input").fastLiveFilter("#dashboard_list");
	}
});
