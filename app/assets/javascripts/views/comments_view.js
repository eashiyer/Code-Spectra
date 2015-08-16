Cibi.CommentsView = Ember.View.extend({
	didInsertElement: function() {
		this.get('controller').send('attachPopover');
		$('.comment_popover').tooltip();
		
	},

	submit: function(e, params) {
		e.preventDefault();
		var comment = {};
		comment.chartId    = this.get('controller').get('content').owner.get('id');
		comment.message    = e.target.elements[0].value;
		comment.authorName   = e.target.elements[1].value;
		// Create a new comment here
		this.get('controller').send('createComment', comment);
	}
});