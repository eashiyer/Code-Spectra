Cibi.DashboardEditChartController = Ember.ObjectController.extend({
	needs: ['chart'],

	/**
	  A ember computed property. Returns an array of all `data_sources` from the server.

	  @method data_sources
	  @param null
	  @return {Array} data_sources
	*/
	data_sources: function() {
		return Cibi.DataSource.find();
	}.property(''),

	/**
	  Returns a JSON representation of dimension string attribute(dimensionStr) from given `DataSource`

	  @method getDimensions
	  @param {Integer} dataSourceId
	  @return {String} dimensionsStr
	*/
	getDimensions: function(dataSourceId) {
		var ds = Cibi.DataSource.find(dataSourceId);
		var dimensionsStr = ds.get('dimensionsStr');
		return JSON.parse(dimensionsStr);
	},

	getDataSource:function(dataSourceId){
		var ds=Cibi.DataSource.find(dataSourceId);
		return ds;
	},

	/**
	  Returns a JSON representation of fields string attribute(fieldsStr) from given `DataSource`

	  @method getFields
	  @param {Integer} dataSourceId
	  @return {String} fieldsStr
	*/
	getFields: function(dataSourceId) {
		var ds = Cibi.DataSource.find(dataSourceId);
		var fieldsStr = ds.get('fieldsStr');
		var fields = JSON.parse(fieldsStr);
		if($.type(fields[0]) == 'object' ){
			var arr = []
			fields.forEach(function(f) {
				arr.push(f['name'])
			});
			var fields = arr;
		}
		return fields;
	},

	/**
	  A computed property. Returns an array of possible fact types: 'money', 'percentage'

	  @method factTypes
	  @param null
	  @return {Array} factTypes
	*/
	factTypes: function() {
		return ['', 'money', 'percentage'];
	}.property(''),

	/**
	  A computed property. Returns an array of possible fact unit: 'USD', 'Rs', 'Euro' , '%'

	  @method factUnits
	  @param null
	  @return {Array} factUnits
	*/
	factUnits: function() {
		return ['', 'USD', 'Rs', 'Euro','%'];
	}.property(''),

	/**
	  Reload all charts 

	  @method refresh
	  @param null
	  @return null
	*/
	refresh: function() {
		this.get('content').forEach(function(chart) {
			chart.reload();
		});
	},

});