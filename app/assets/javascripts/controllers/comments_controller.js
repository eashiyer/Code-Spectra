/** 
*@class Cibi.CommentsController
*/

/**
  `Cibi.CommentsController` manages an array of `Comment` records.

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.

  @class Cibi.CommentsController
  @extends Ember.ArrayController
*/
Cibi.CommentsController = Ember.ArrayController.extend({

	/**
	  Attaches a popover to `a[rel=popover]` element in DOM, with content as comments list
	  and a new comment form.

	  See comments.handlebars template. 

	  @method attachPopover
	  @param null
	  @return null
	*/
	attachPopover: function() {
		var obj = this;
		$(".comment_popover").popover({
			html : true,
			title: function() {
			  return "<strong>Comments</strong>";
			},
			content: function() {
				var html = "<div style=\"height: 200px; width: 320px; overflow: auto;\">";
				html += $(this).find("#list_comments").html();
				html += $(this).find("#new_comment").html();
				html += "</div>"
			  	return html;
			},
			placement: "bottom",
		}).click(function(e) {
			 var elem = $(this);
			e.preventDefault();
			
			$('.popover').each(function () {
				var target=elem;
				 if(!($(this).find('.popover-title').text()=="Chart Annotations")){
					$(this).addClass("hidden");				
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i ++) {
						var a = $(childElems[i]);
						a.addClass("hidden");
					}
				 }
				 else{
				 	if($(this.parentElement).find('a')[0].id==target[0].id)
				 	{
				 		$(this).removeClass('hidden');
				 		var left_pos =($(this.parentElement).offset().left)-105;
				 		if(left_pos < 1000 ){
				 			$(this).offset({left:left_pos})
				 		}
					 	var childElems = $(this).children();
						for(var i = 0; i < childElems.length; i ++) {
							var a = $(childElems[i]);
							a.removeClass("hidden");
						}
				 	}
				 	else
				 	{
				 		$(this).addClass("hidden");				
						var childElems = $(this).children();
						for(var i = 0; i < childElems.length; i ++) {
							var a = $(childElems[i]);
							a.addClass("hidden");
						}
				 	}					
				}
		    });
			
		});

		$(".comment_popover").on('shown.bs.popover', function () {
		  	$(".comment_popover").closest("li").find(".arrow").css("left","117px");
		});
  	},

  	popoverId: function() {
  		return 'comments-icon-' + this.get('content').get('owner').get('id');
  	}.property(''),

	/**
	  Creates a new comment, attach it to respective chart where it belongs_to and commits it to the server and then toggles the popover.
		
	  @method createComment
	  @param {Object} Comment comment object
	  @return null
	*/
  	createComment: function(comment) {
  		var c = Cibi.Comment.createRecord(comment);
  		c.set('chart', Cibi.Chart.find(comment.chartId));
  		c.get('transaction').commit({'comment': comment});
  		$("#" + this.get('popoverId')).popover('toggle');
  	},

	/**
	  A computed property. Returns an array of comments whose status is zero, ie that are active.

	  It is recalculated every time status of any `Comment` model is changed.
	  That is why `.property('@each.status')`

	  @method activeComments
	  @param null
	  @return {Array} Comments
	*/
	activeComments: function() {
		var comments = this.filter(function(comment) {
		  return comment.get('status') == 0;
		});
		return comments;
	}.property('@each.status'),

	/**
	  Returns the count of active comments.

	  @method commentsCount
	  @param null
	  @return {Integer} commentsCount
	*/
	commentsCount: function() {
		return this.get('activeComments').get('length');
	}.property('activeComments'),

	/**
	  Returns true of `commentsCount` > 0

	  @method hasComments
	  @param null
	  @return {Boolean} hasComments
	*/
	hasComments: function() {
		return this.get('commentsCount') > 0
	}.property('commentsCount'),
});