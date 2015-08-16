/** 
*@class Cibi.VerticalsController
*/

/**
  `Cibi.VerticalsController` is the controller class for array of objects of type `vertical`

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.

  @class Cibi.VerticalsController
  @extends Ember.ArrayController
*/
Cibi.VerticalsController = Ember.ArrayController.extend({

	transitionToFirstVertical: function() {
		if(Cibi.Auth.get('signedIn') && this.target.get('url')=="/verticals"){
			var vertical = this.get('firstObject');
			if(vertical) {
				this.transitionToRoute('vertical', vertical);
			}
		}		
	}.observes('firstObject'),

	/**
	  Updates the name of given vertical and commits it to the server.

	  @method updateVertical
	  @param {Integer} Id
	  @param {String} newName
	  @return null 
	*/
	updateVertical: function(id, newName) {
		var v = Cibi.Vertical.find(id);
		v.set('name', newName);
		v.get('store').commit();
	},
	
	createVertical: function(vertical) {
		var obj=this;
		var v = Cibi.Vertical.createRecord(vertical);				
		
		v.on('becameInvalid',function(errors){
			this.transaction.rollback();
			obj.set('errors',errors.errors.name);
		});

		v.on('didCreate',function(){
			if(obj.get('content').get('lastObject') !== undefined){
				obj.transitionToRoute('vertical', v);
			}
		});

		v.transaction.commit({'vertical': vertical });
	},
});