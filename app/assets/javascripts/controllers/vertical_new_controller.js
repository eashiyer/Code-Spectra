/** 
*@class Cibi.VerticalNewController
*/

/**
  `Cibi.VerticalNewController` is the controller class for `vertical` model.
  Specifically for vertical 'new' action.

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.

  Ember creates controller for each model and also for model's possible routes implicitly, that is in memory, while the code is being executed.
  This is called __active__ __code__ __generation__.
  Sometimes we need to override default behavior, or handle specific actions, like `createDashboard` in this case.
  
  So we have created this controller. This action is triggered from _vertical/new.handlebars_ template.
  
  @class Cibi.VerticalNewController
  @extends Ember.ObjectController
*/
Cibi.VerticalNewController = Ember.ObjectController.extend({

	needs: 'vertical',
	/**
	  Creates a new dashboard and commits it to the server.

	  @method createDashboard
	  @param {Object} dashboard
	  @return null 
	*/
	createDashboard: function(dashboard) {
		var obj = this;
		var d = Cibi.Dashboard.createRecord(dashboard);
		var vertical = this.get('controllers').get('vertical').get('content');

		d.set('vertical', vertical);
		d.on('didCreate', function(d) {
			obj.set('dashboardCreated', true);
			setTimeout(function() {
				obj.set('dashboardCreated', null);
			}, 3000);
		})
		d.transaction.commit({'dashboard': dashboard });
        // vertical.reload();
	}
});