/**
@class Cibi.DataSource
*/

/**
  `Cibi.DataSource` is the `DataSource` model

  A DataSource has following attributes:

  `content, dimensionsStr, groupsStr, fieldsStr, name, dataSourceType`

  A `DataContent` has_many `DataContents` and `ChartsDataSource`

  A `DataContent` belongs_to `QueryDataSource`

  @class Cibi.DataSource
*/
Cibi.DataSource = DS.Model.extend({
	content: DS.attr('string'),
	dimensionsStr: DS.attr('string'),
	groupsStr: DS.attr('string'),
	fieldsStr: DS.attr('string'),
	name: DS.attr('string'),
	dataSourceType: DS.attr('string'),
	accountId: DS.attr('number'),
	loadCount: DS.attr('number'),
	enabled: DS.attr('boolean'),
	dataTypesUpdated: DS.attr('boolean'),
	uniqueStr: DS.attr('string'),
	indexStr: DS.attr('string'),
	fileUploadState: DS.attr('number'),
	sheetsArray: DS.attr('string'),
	ignoredStr: DS.attr('string'),
	previewHeaders: DS.attr('string'),
	previewData: DS.attr('string'),
	rulesStr: DS.attr('string'),	
	updatedAt: DS.attr('date'),

	chartsDataSources: DS.hasMany('Cibi.ChartsDataSource'),
	dataContents: DS.hasMany('Cibi.DataContent'),
	userFilters: DS.hasMany('Cibi.UserFilter'),
	queryDataSource: DS.belongsTo('Cibi.QueryDataSource'),
	spreeDataSource: DS.belongsTo('Cibi.SpreeDataSource'),
	accountTemplate: DS.belongsTo('Cibi.AccountTemplate'),
	rules: DS.hasMany('Cibi.Rule'),

	nextRun: function(){
		var obj = this;
		var data_source_type = obj.get('dataSourceType');
		var data_source_obj = (data_source_type == 'mysql' || data_source_type == 'mssql' || data_source_type == 'oracle') ? obj.get('queryDataSource') : obj.get('spreeDataSource')
		if(data_source_obj){
			var frequency = (data_source_type == 'mysql' || data_source_type == 'mssql' || data_source_type == 'oracle') ? data_source_obj.get('frequency') : data_source_obj.get('frequencyOfImport')
			var last_run = (data_source_obj.get('lastRunAt')) ? data_source_obj.get('lastRunAt') : data_source_obj.get('createdAt');
			var d = new Date(last_run);
			d.setMinutes(d.getMinutes() + (data_source_obj ? frequency : 0));
			return new Date(d);
		}
		return false;
	}.property('queryDataSource.isLoaded', 'spreeDataSource.isLoaded', 'queryDataSource.lastRunAt', 'spreeDataSource.lastRunAt'),

	lastRunStatus: function(){
		var obj = this;
		var data_source_type = obj.get('dataSourceType');
		var data_source_obj = (data_source_type == 'mysql' || data_source_type == 'mssql' || data_source_type == 'oracle') ? obj.get('queryDataSource') : false;
		if(data_source_obj){
			return (data_source_obj.get('last_run_status') + " on " + data_source_obj.get('lastRunAt'));
		}
		return false;
	}.property('queryDataSource.isLoaded', 'spreeDataSource.isLoaded', 'queryDataSource.lastRunAt', 'spreeDataSource.lastRunAt'),

	getDataSourceFields: function() {
		var fieldsStr = this.get('fieldsStr')
		if(!fieldsStr) {
			return [];
		}
		var fields = JSON.parse(fieldsStr);
			var arr = []
		fields.forEach(function(f) {
			arr.push(f[Object.keys(f)[0]])
		});
		var fields = arr;
		return fields;
	}.property('fieldsHash'),

	fieldsArr: function() {
		var fieldsStr = this.get('fieldsStr')
		if(!fieldsStr) {
			return [];
		}
		var fields = JSON.parse(fieldsStr);
		if(!fields) {
			return [];
		}
		return fields.map (function(f) {
			return f['name'];
		})
		// if($.type(fields[0]) == 'object' ){
		// 	var arr = []
		// 	fields.forEach(function(f) {
		// 		arr.push(Object.keys(f)[0])
		// 	});
		// 	var fields = arr;
		// }

		// var dimensions = JSON.parse(this.get('dimensionsStr'));
		// var ret = _.difference(fields, dimensions);
		// ret = _.filter(ret, function(d) {
		// 	return d && d.trim() != '';
		// })
		// return ret;
	}.property('dimensionsStr', 'fieldsStr'),

	uniqueKeyFieldsArr: function(){
		var fieldsArr = this.get('fieldsArr');
		return [''].concat(fieldsArr);
	}.property('fieldsArr'),

	uniqueKeyField : function(){
		var uniqueKeyFields = JSON.parse(this.get('uniqueStr'));
		uniqueKeyFields = _.filter(uniqueKeyFields, function(d) {
			return d;
		});
		return uniqueKeyFields.objectAt(0);
	}.property('uniqueStr'),

	fieldsHash: function() {
		var fieldsStr = this.get('fieldsStr')
		if(!fieldsStr) {
			return [];
		}
		var fields = JSON.parse(fieldsStr);
		return fields;
	}.property('fieldsStr', 'dataTypesUpdated'),

	dataPreviewHash: function() {
		var previewStr = this.get('previewData')
		if(!previewStr) {
			return false;
		}
		var data = JSON.parse(previewStr)["data"];
		return data;
	}.property('previewHeaders'),

	totalRows: function() {
		var previewStr = this.get('previewData')
		if(!previewStr) {
			return false;
		}
		var num_rows = JSON.parse(previewStr)["length"];
		return num_rows;
	}.property('previewHeaders'),

	previewHeadersArr: function() {
		var previewStr = this.get('previewHeaders');
		if(!previewStr) {
			return [];
		}
		data = JSON.parse(previewStr);
		var arr = []
		data.forEach(function(f) {
			arr.push(f['name'])
		});
		return arr;
	}.property('previewHeaders'),

	uniqueKeyArr: function() {
		var dimensionStr = this.get('uniqueStr');
		if(!dimensionStr) {
			return [];
		}
		var ret = JSON.parse(dimensionStr);
		ret = _.filter(ret, function(d) {
			return d;
		});
		return ret;
	}.property('uniqueStr'),

	save: function() {
		var obj = this;
  		obj.get('transaction').commit({'data_source': obj});		
	},

    createDimensionFunction: function(key) {
        var fn = function(d) {
        	if(d[key]) {
        		return d[key].trim();	
        	} 
        	return "";
        };
        return fn;
    },

	getDimension: function(dimension) {
		var dimensionsMap = this.get('dimensionsMap');
		if(dimensionsMap) {
			// var keys = Object.keys(dimensionsMap);
			// _.each(keys, function(k){
			// 	while (k.toLowerCase() !== dimension.toLowerCase()) {
			// 		continue;
			// 	}

			return dimensionsMap[dimension];

		} else {
			return false;
		}
	},
	
	shouldReload: function() {
		var loaded = this.get('isLoaded') && this.stateManager.currentState.name == "saved";
		var has_content = this.get('content');
		return !has_content && loaded;
	},

	// getDataTypeOld:function(field) {
	// 	var fields=JSON.parse(this.get('fieldsStr'));
	// 	var dataTypeMap=Ember.Map.create();
	// 	fields.forEach(function(f){
	// 		var key=Object.keys(f)[0];
	// 		dataTypeMap.set(key,f[key]);			
	// 	});
	// 	return dataTypeMap.get(field);
	// },

	getDataType:function(field) {
		var fields=JSON.parse(this.get('fieldsStr'));
		var type = '';
		fields.forEach(function(f){
			if(f['name'] == field){
				type =  f['data_type'];
			}			
		});
		return type;
	},		

	imageUrl: function() {
		var dataSourceType = this.get('dataSourceType');
		return "/assets/" + dataSourceType;
	}.property(''),

	factsArr: function() {
		return this.get('fieldsArr');
	}.property('fieldsStr'),

	depthArr: function() {
		return this.get('dimensionsArr');
	}.property('dimensionsStr'),

	multipleSheets: function() {
		return this.get('fileUploadState') == 1
	}.property('fileUploadState'),

	uploadedToRedis: function(){
		return this.get('fileUploadState') == 3;
	}.property('fileUploadState'),

	ruleApplied: function(){
		return this.get('fileUploadState') == 4;
	}.property('fileUploadState'),

	headerArr: function() {
		var fieldsStr = this.get('fieldsStr')
		if(!fieldsStr) {
			return [];
		}
		var fields = JSON.parse(fieldsStr);
		if($.type(fields[0]) == 'object' ){
			var arr = []
			fields.forEach(function(f) {
				arr.push(Object.keys(f)[0])
			});
			var fields = arr;
		}

		var dimensions = JSON.parse(this.get('dimensionsStr'));
		var ret = _.difference(fields, dimensions);
		ret = _.filter(ret, function(d) {
			return d && d.trim() != '';
		})
		return ret;
	}.property(''),

	getUniqueKeys: function(field, formatAs, callback, obj) {
		var self = this;
		if(!field) {
			return [];
		}

		var field_unique_keys = self.get('field_unique_keys') || {};
		if(field_unique_keys[field+formatAs]) {
			keys = field_unique_keys[field+formatAs];
            if(callback != undefined){
            	callback(keys, obj)
            }
		} else {
			var auth_token = Cibi.Auth.get('authToken');
			var url = '/data_sources/' + this.get('id') + '/uniqueKeys?field=' + field + '&auth_token=' + auth_token;
			if(formatAs) {
				url += "&formatAs=" + formatAs;
			}		
			console.log(url);
	        req = $.ajax({
	            url: url,
	            type: 'get',
	            async: true,//(callback != undefined) ? true : false,
	            success: function(result) {
	                keys = result['keys']; 
	                field_unique_keys[field+formatAs] = keys;             
	                self.set('field_unique_keys', field_unique_keys);
	                if(callback != undefined){
	                	callback(keys, obj)
	                }            
	            }
	        });
	        if(callback == undefined){
				return keys.sort();
			}
		}
	},

});

