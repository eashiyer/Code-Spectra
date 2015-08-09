Cibi.DataSourcesController = Ember.ArrayController.extend({
	transitionToFirstDataSource: function() {
		if(Cibi.Auth.get('signedIn') && this.target.get('url')=="/data_sources"){
			var dataSource = this.get('firstObject');
			if(dataSource) {
				this.transitionToRoute('data_source', dataSource);
			}
		}
	}.observes('firstObject'),
});