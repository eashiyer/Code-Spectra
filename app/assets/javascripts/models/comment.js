/**
@class Cibi.Comment
*/

/**
  `Cibi.Comment` is the `Comment` model

  A comment has following attributes: 

  `message, authorName, status`

  In addition, a comment has following relationships:

  belongs_to chart
  
  @class Cibi.Comment
*/
Cibi.Comment = DS.Model.extend({
	message: DS.attr('string'),
	authorName: DS.attr('string'),
	status: DS.attr('number'),
	
	chart: DS.belongsTo('Cibi.Chart'),

	commentsContainerId: function() {
		return "chart-comments-" + this.get('chart').get('id');
	}.property('id'),

});