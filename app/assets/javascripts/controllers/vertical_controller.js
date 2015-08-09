/** 
*@class Cibi.VerticalController
*/

/**
  `Cibi.VerticalController` is the controller class for `vertical` model.

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.

  @class Cibi.VerticalController
  @extends Ember.ObjectController
*/
Cibi.VerticalController = Ember.ObjectController.extend({

	/**
	  Returns current vertical's id

	  @method currentVertical
	  @param null
	  @return {Integer} Id
	*/
	currentVertical: function() {
		return this.get('id');
	},

	getNextDashBoards:function(){
		var length = this.get('content').get('dashboards').get('length');
		if((this.get('content').get('currentPage')*4)<length)
		{
			this.get('content').set('currentPage',this.get('content').get('currentPage')+1);
		}
	},

	getPreviousDashBoards:function()
	{
		if(this.get('content').get('currentPage')>1)
		{
			this.get('content').set('currentPage',this.get('content').get('currentPage')-1);
		}
	},
});