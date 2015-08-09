/** 
*@class Cibi.CommentController
*/

/**
  `Cibi.CommentController` is the controller class `Comment` model.

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.
 
  @class Cibi.CommentController
  @extends Ember.ObjectController
*/
Cibi.CommentController = Ember.ObjectController.extend({
	needs: ['comments'],
	
	/**
	  Changes the comment status = 1(means resolved), and commits the record.

	  @method markComplete
	  @param null
	  @return null
	*/
	markComplete: function() {
		var comment = this.get('content');
		comment.set('status', 1);
		comment.get('transaction').commit({'comment': comment});
		$("#" + this.get('popoverId')).popover('toggle');
	},

	/**
	  A computed property. It is re-calculated automatically by Ember whenever the `status` property of comment model changes.
	  Returns a css class for comment.

	  Returns 'muted' if status == 1

	  @method commentClass
	  @param null
	  @return {String} css_class
	*/
	commentClass: function() {
		return this.get('status') == 1 ? 'muted' : '';
	}.property('status'),

	popoverId: function() {
		return 'comments-icon-' + this.get('content').get('chart').id;
	}.property('content')

})