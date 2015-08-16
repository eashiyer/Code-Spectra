Cibi.UserMgmtUserController = Ember.ObjectController.extend({
	  dataSources: function() {
	   	  return Cibi.DataSource.find();
  	}.property(''),

    getDimensionUniqueVals: function(dimension_name, callback, viewObj) {
        var obj = this;
  		if(!dimension_name) {
  			return [];
  		}
  		var data_source = viewObj.get('dataSource');
  		if(!data_source) {
  			return [];  			
  		}
  		data_source.getUniqueKeys(dimension_name, null, callback, viewObj);
  	},    

});