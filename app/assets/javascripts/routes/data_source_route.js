Cibi.DataSourceRoute = Cibi.AuthorizedRoute.extend({
	events: {
		willTransition: function(transition) {
			this.controller.set('fileUploadFailed', false);
		},
	},

	model: function(params) {
		return Cibi.DataSource.find(params.data_source_id, {summary: true});	
	},
});

