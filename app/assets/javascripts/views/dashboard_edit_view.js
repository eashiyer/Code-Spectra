 Cibi.DashboardEditView = Ember.View.extend({

	submit: function() {
		var d = this.get("controller").get('content');
		var vertical_controller = this.get('controller').get('controllers').get('vertical');
		d.set('vertical', vertical_controller.get('content'));
		d.on('didUpdate', function(d) {
		 	$("#new-dashboard-notice").html("<h4 class='alert alert-success'> Dashboard updated!</h4>");
		});
		d.get('store').commit();
	},
 });