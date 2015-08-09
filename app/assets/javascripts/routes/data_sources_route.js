Cibi.DataSourcesRoute = Cibi.AuthorizedRoute.extend({
	model: function() {
		return Cibi.DataSource.find();	
	},
	
	
});

Cibi.DataSourcesNewRoute = Ember.Route.extend({
	setupController: function(controller, model) {
		this.controllerFor('dataConnections').set('model', Cibi.DataConnection.find());
	}
});


Cibi.DataSourcesIndexRoute = Ember.Route.extend({
	model: function() {
		return Cibi.DataSource.find();	
	},

	redirect: function(model,transition) {
		var data_source = model;
		if(typeof data_source !== undefined && data_source.get('isLoaded')) {
			var first_data_source = data_source.get('firstObject');
			if(typeof first_data_source !== "undefined") {
				this.transitionTo('data_source', first_data_source);
			}
		}
	},
});

Cibi.DataSourcesEditRoute = Ember.Route.extend({
	model: function(params) {
		return Cibi.DataSource.find(params.data_source_id, {summary: true});	
	},
});