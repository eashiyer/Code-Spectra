Cibi.DashboardNewController = Ember.ObjectController.extend({

	data_sources: function() {
		return Cibi.DataSource.find();
	}.property(''),

	show_accordian: function(data_source) {
		alert(data_source.id);
	}.property(''),

	getFields: function(dataSourceId) {
		var ds = Cibi.DataSource.find(dataSourceId);
		var fieldsStr = ds.get('fieldsStr');
		var fields = JSON.parse(fieldsStr);
		if(fields && fields != null && $.type(fields[0]) == 'object' ){
			var arr = []
			fields.forEach(function(f) {
				arr.push(f['name'])
			});
			var fields = arr;
		}
		return fields;
	},
});