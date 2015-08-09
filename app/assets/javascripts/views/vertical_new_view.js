Cibi.VerticalNewView = Ember.View.extend({
	didInsertElement:function(){
		$("#createDashHead").addClass('hidden');
	},

	cancel:function(){
		if(!(Cibi.Vertical.find(this.get('elementId')).get('dashboards').length))
		{
			$("#createDashHead").removeClass('hidden');
		}
		javascript:history.go(-1); 
		return false;
	},

	submit: function(e, params) {
		e.preventDefault();
		var displayName = this.get('displayName');
		if(!displayName) {
			$("#display_name_control_group").addClass("error");
			return;
		} else {
			$("#display_name_control_group").removeClass("error");

		}

		var title = this.get('title');
		if(!title) {
			$("#title_control_group").addClass("error");
			return;
		} else {
			$("#title_control_group").removeClass("error");
	
		}		
		var dashboard = {};
		// dashboard.displayName = e.target.elements[1].value;
		// dashboard.title       = e.target.elements[2].value;
		// dashboard.subtitle    = e.target.elements[3].value;
		// dashboard.verticalId = $('#currentVertical').val();

		dashboard.displayName = displayName;
		dashboard.title       = title;
		dashboard.subtitle    = this.get('subtitle');
		dashboard.description = this.get('description');
		dashboard.autoRefresh = this.get('autoRefresh');
		dashboard.refreshInterval = this.get('refreshInterval');
		dashboard.rows=2;
		dashboard.columns=2;
		this.get('controller').send('createDashboard', dashboard);

		this.set('displayName',"");
		this.set('title',"");
		this.set('subtitle',"");
		this.set('description', "");
	}

});

