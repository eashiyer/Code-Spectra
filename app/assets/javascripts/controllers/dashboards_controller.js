/** 
*@class Cibi.DashboardsController
*/

/**
  `Cibi.DashboardsController` manages an array of `Dashboard` records.

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.

  @class Cibi.DashboardsController
  @extends Ember.ArrayController
*/
Cibi.DashboardsController = Ember.ArrayController.extend({
	
	/**
	  A ember computed property. Returns the current vertical... it fetches it from `Dashboard` model.
	  It is computed everytime automatically when there is a change in `Dashboard` model.

	  @method currentVertical
	  @param null
	  @return {Integer} verticalId
	*/
	currentVertical: function() {
		return this.get('content').objectAt(0).get('currentVertical');
	}.property('content'),

	can_edit: function() {
		var isAdmin = Cibi.Auth.get('currentUser').get('isAdmin');
		if (isAdmin) {
			return isAdmin;
		}
		var role = Cibi.Auth.get('currentUser').get_role('Vertical', this.get('currentVertical'));
		return role && ( role == 'admin' || role == 'manager' )
	}.property('Cibi.Auth.currentUser.isLoaded'),

	can_destroy: function() {
		var isAdmin = Cibi.Auth.get('currentUser').get('isAdmin');
		if (isAdmin) {
			return isAdmin;
		}
		var role = Cibi.Auth.get('currentUser').get_role('Vertical', this.get('currentVertical'));
		return role &&  role == 'admin'
	}.property('Cibi.Auth.currentUser.isLoaded'),

});