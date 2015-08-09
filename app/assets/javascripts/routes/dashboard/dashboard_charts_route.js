Cibi.DashboardChartsRoute = Cibi.AuthorizedRoute.extend({
	events: {
		willTransition: function(transition) {
			if( transition.targetName == "vertical.index") {
				if(Cibi.Auth.get('dashboardInterval')){
					clearInterval(Cibi.Auth.get('dashboardInterval'));
				}
				var dashboard = this.modelFor('dashboard');
				if(dashboard) {
					dashboard.set('showDashboardFilters', false);
					dashboard.set('drawCharts', false);				
				}
				$("#"+dashboard.get('tabId')).find(".sort-icon").attr('style','background-color:#4093cd');
	        	$("#"+dashboard.get('tabId')).find(".chart-control-bar").css("cursor", "default");
	        }		

	        if(transition.targetName == "dashboard.new" || transition.targetName == "dashboard.edit_chart"){
	        	var dashboard = this.modelFor('dashboard');
	        	if(dashboard) {
	        		dashboard.set('chartNewEditRoute', true);
	        	}
	        }
		},    
	},

	

	model: function(params) {
		var dashboard = this.modelFor('dashboard');
		if(dashboard) {
			var dashboard_id = dashboard.get('id');
			if(dashboard_id) {
				return Cibi.Chart.find({dashboard_id: dashboard_id});

			}	
		}
	},

	afterModel: function(charts, transition) {
		var dashboard = this.modelFor('dashboard');
		if(dashboard) {
			// var filter_str = transition.params.filter;
			dashboard.set('showDashboardFilters', true);
			dashboard.set('drawCharts', true);
			dashboard.set('chartNewEditRoute', false);
			if(dashboard.get('autoRefresh') && dashboard.get('refreshInterval')){
				var interval=setInterval(function(){ 
				    dashboard.drawAll();    
				}, (dashboard.get('refreshInterval')*1000));
				Cibi.Auth.set('dashboardInterval', interval);	
			}
			Cibi.ScheduledReport.find({dashboard_id: dashboard.id}).then(function (report) {
				dashboard.set('scheduled_report',report)
			});
		}		
	},

	renderTemplate: function() {
		this.render('charts');
	}
});