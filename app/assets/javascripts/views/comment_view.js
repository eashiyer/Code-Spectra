Cibi.CommentView = Ember.View.extend({
	templateName: 'comments/show',
	
	statusView: Ember.Checkbox.extend({
		checkedBinding: ['status'],
		change: function (e) {
			this.get('controller').send('markComplete');
		}
	}),
});