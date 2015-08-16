/** 
*@class Cibi.DataSourceController
*/

/**
  `Cibi.DataSourceController` is the controller class for `data_source` model.

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.

  @class Cibi.DataSourceController
  @extends Ember.ObjectController
*/
Cibi.DataSourceController = Ember.ObjectController.extend({

	/**
	  A computed property. Returns 'csv' or 'excel', depending on dataSourceType attribute of `data_source` model.

	  @method fileDataSource
	  @param null
	  @return {String} fileDataSource ..csv or excel
	*/
	fileDataSource: function() {
		var dataSourceType = this.get('dataSourceType');
		return ["csv", "excel"].indexOf(dataSourceType) != -1;
	}.property('dataSourceType'),

	queryDataSourceApi: function(){
		var dataSourceType = this.get('dataSourceType');
		return ["mysql", "mssql", "oracle"].indexOf(dataSourceType) != -1;
	}.property('dataSourceType'),

	spreeApi: function() {
		var dataSourceType = this.get('dataSourceType');
		return dataSourceType == "spree_commerce";
	}.property('dataSourceType'),

	containerId: function() {
		return 'data-source-' + this.get('id');
	}.property('id'),

	containerId1: function() {
		return '#data-source-content-' + this.get('id');
	}.property('id'),

	containerId2: function() {
		return 'data-source-content-' + this.get('id');
	}.property('id'),

	/**
	  Sets selected `field` to `fieldsStr` attribute of current `data_source`

	  @method createFieldsArr
	  @param {String} field
	  @return null
	*/
	createFieldsArr: function(fieldsArr, unique_keys, ignored_keys, isDirect) {
		var obj = this;
		var newfieldsStr = JSON.stringify(fieldsArr.uniq());
		var rec = this.get('content');
		rec.set('fieldsStr', newfieldsStr);
		rec.set('uniqueStr', JSON.stringify(unique_keys));
		rec.set('ignoredStr', JSON.stringify(ignored_keys));
		if(isDirect){
			rec.set('enabled', false);
          	rec.set('dataTypesUpdated', true);
          	rec.set('fileUploadState', 4);
		}
		rec.on('becameInvalid', function(errors){
			this.set('fieldsStr', null);
			this.set('fileUploadState', null);
			//this.get('store').commit();
            obj.set('uploadError', true);
            if(errors.errors.name == 'invalid date'){
            	obj.set('errorMessage', "We’re sorry! Looks like the date fields you specified were in an incompatible format. Please specify proper date format and try uploading the file again");
            }else{
            	obj.set('errorMessage', errors.errors.name);
            }         	
			this.get('stateManager').transitionTo('loaded')
		});

		setTimeout(function() {
			obj.showProgress();
		}, 3000);

		rec.get('transaction').commit();
	},

	/**
	  Updates all changes to server. Delegates call to save() on DataSource model.

	  @method save
	  @param null
	  @return null
	*/
	save: function() {
		this.get('content').save();
	},

	/**
	  Sets params attributes on groupsStr

	  @method updateGroup
	  @param {Object} attributes
	  @return null
	*/
	updateGroup: function(attributes) {
		var group = JSON.parse(this.get('groupsStr')) || {};
		group[attributes.key] = attributes.value;
		this.get('content').set('groupsStr', JSON.stringify(group));
	},



	/**
	  Deletes the selected data_content and commits changes to the server.

	  		var ds = this.get('content');

	  The `content` property is a proxy to model data. So whenever `this.get('content')` is called in controller
	  It returns the model data associated with it. In this case `data_source`

	  It also reloads the data_source associated with the data_content object after deleting data_content.
	  Reload is required for Ember to pick up changes so that it can update the template.
	    	
	    	dc.on('didDelete', function() {
				ds.reload();
			})

	  Here we are listening on 'didDelete' event on data_content object.
	  It is emitted by ember after it successfully deletes it.
	  All operations in ember are asynchronous. So we reload data_source only when we are sure that dc got deleted.

	  @method deleteDataContent
	  @param {Object} data_content
	  @return null
	*/
	deleteDataContent: function(dc) {
		var obj = this;
		var r = confirm("Are you sure you want to delete this data-content file?");
		if (r === true) {
			var ds = obj.get('content');
			Cibi.DataContent.find(dc.id).then(function(rec){
				var dat = rec;
			  	rec.deleteRecord();
			  	rec.save();
			  	rec.on('didDelete', function() {
			  		// ds.get('dataContents').removeObject(dat);
					
					var datacontents = ds.get('data_contents');
					datacontents.removeObject(dc);
					if(datacontents.length == 0){
						var pageno = ds.get('pageno');
						ds.set('pageno',pageno-1);
					}
					var totalContents = ds.get('total_contents');
					ds.set('total_contents',totalContents-1);
					// var store = datacontents.get('store');
					// store.commit();
					ds.reload();
				});
				// 
				// 
				ds.set("field_unique_keys",null);
				// 
			});
			// dc.deleteRecord();			
		}
	},


	/**
	  Returns 

	  @method queryDetails
	  @param null
	  @return {Object} queryDetails ..plain javascript object
	*/
	queryDetails: function() {
		var qds = this.get('queryDataSource');
		if(qds && qds.get('isLoaded')) {
			var queryDetails = { 
				query: qds.get('query'),
				enabled: qds.get('enabled'),
				frequency: qds.get('frequency'),
				import_type: qds.get('importType'),
				data_connection_id: qds.get('dataConnectionId'),
				bookmark_key: qds.get('bookmarkKey'),
				bookmark_comparison : qds.get('bookmarkComparisonOperator')
			};
			return queryDetails;
		}
	}.property('queryDataSource.isLoaded'),

	createRule: function(combine_columns, new_keys_column, new_values_column) {
		var rules_str = {};
		rules_str['combine_columns'] = combine_columns;
		rules_str['keys_column'] = new_keys_column;
		rules_str['values_column'] = new_values_column;
		ds = this.get('content');
		ds.set('rulesStr',JSON.stringify(rules_str));
		ds.set('fileUploadState',4);
		
		var field_arr = _.difference(ds.get('fieldsArr'), combine_columns.split(','));
        field_arr.push(new_keys_column);
        field_arr.push(new_values_column);

        var arr = [];
		field_arr.forEach(function(el) {
			var field_hash = {};
			field_hash['name'] = el; 
		    field_hash['datatype'] = 'string'; 
		    arr.push(field_hash); 
		});

		ds.set('fieldsStr',JSON.stringify(arr));

		ds.get('transaction').commit();  
	},

	isUploadingFile: function(){
		return !(this.get('content').get('fileUploadState') == null || this.get('content').get('dataTypesUpdated') == true) ;
	}.property('fileUploadState'),

	visibilty: function(){
		if(this.get('isUploadingFile')){
			return 'invisible';
		}else{
			return 'visible';
		}
	}.property('fileUploadState'),

	cancelUploadProcess: function(){
			var auth_token = Cibi.Auth.get('authToken');
			var obj = this;
			var content = obj.get('content');
			var url_str = '/data_sources/'+ content.get('id') +'/clearRedisCache?auth_token=' + auth_token;
	        req = $.ajax({
	            url: url_str,
	            type: 'post',
	            async: false,
	            success: function(result) {

	            },
	        });
	        if(content.get('dataContents').get('length') == 0){
	    		content.set('fileUploadState', null);
	        	content.set('fieldsStr', null);	
	        	content.set('sheetsArray', null);	           	
	        }else{
	        	content.set('fileUploadState', 4);
	        }	      
	        content.get('store').commit();	

	},

	showProgress: function(){
		  var obj = this;
		  var auth_token = Cibi.Auth.get('authToken');	
		  var id = obj.get('content').get('id');
		  var progress;
		  progress = parseInt($("#progressbar").text());
		  if (progress > 100){
		  	$("#progressbar").text('0');
		  }	  

		  console.log('start_time: '+ currentTime());   
		  if ((obj.get('isError') == false) && progress < 100 && (obj.get('isAddingContent') == true) || this.get('isSaving') == true) {
				var url = '/data_sources/' + id + '/getUploadProgress?auth_token=' + auth_token;
		        req = $.ajax({
		            url: url,
		            type: 'get',
		            async: true,
		            success: function(result) {
		            	var count = parseInt(result['count']);
		            	console.log('response_time: '+ currentTime());
		            	var increment = progress + (count-progress);
		            	console.log(increment);
           		        $("#progressbar").text(increment);
		     			$("#progressbar").css('width', (increment).toString() + '%')
		            }
		        });

				setTimeout(function() {
				    obj.showProgress(); 
				}, 3000);
		  }
	},

	progressVisible: function(){
		if(this.get('isSaving') || this.get('isAddingContent')){
			return 'visible';
		}else{
			return 'invisible';
		}
	}.property('fileUploadState', 'isSaving', 'isAddingContent'),

	previewResults: function(query, dataConnectionId){
		var obj=this;
		if(query && query.trim().length>0){
			console.log(query);
			var auth_token = Cibi.Auth.get('authToken');
			var id=obj.get('content').get('id');
	        var url="/data_sources/"+id+"/preview_results?auth_token=" + auth_token;        

	        $.ajax({
	                url: url,
	                type: 'post',
	                data: {	'query': query,
	            			'dataConnectionId': dataConnectionId},
	                async: false,
	                success: function(response, msg) {
	                  	var res  = response["data_sources"];
	                	if(res.length > 0){
	                		obj.set("preview_results", response["data_sources"]);
	                  		obj.set("preview_error", undefined);	
	                	}else{
	                		obj.set("preview_results", undefined);
	                  		obj.set("preview_error", "The query returned 0 records.");
	                	}	                  	
	                  	obj.set('data_loading', false);
	                },
	                error: function(req, msg, err) {
	                	obj.set("preview_results", undefined);
	                  	obj.set("preview_error", req.responseJSON.message);
	                  	obj.set('data_loading', false);
	                }
	        });	
		}
	},

	createTable: function(jsonArr, uniqueKeysArr, ignoredKeysArr){
		var obj=this;
		if(jsonArr && jsonArr.length>0){
			var auth_token = Cibi.Auth.get('authToken');
			var id=obj.get('content').get('id');
	        var url="/data_sources/"+id+"/create_table?auth_token=" + auth_token;        

	        $.ajax({
	                url: url,
	                type: 'post',
	                data: {	'fields_arr': JSON.stringify(jsonArr),
	                		'unique_keys': JSON.stringify(uniqueKeysArr)
	            	},
	                async: false,
	                success: function(response, msg) {
	                  	console.log(msg);	                  	
	                  	obj.createFieldsArr(jsonArr,uniqueKeysArr,ignoredKeysArr, true);
	                  	obj.set('data_loading', false);
	                },
	                error: function(req, msg, err) {
	                  	obj.set("preview_error", req.responseJSON.message);
	                  	obj.set('data_loading', false);
	                }
	        });	
		}
	},

	fetchData: function(){
		var obj=this;
		obj.set('data_loading', true);
		var auth_token = Cibi.Auth.get('authToken');
		var ds = obj.get('content');
		var id=ds.get('id');
	    var url="/data_sources/"+id+"/fetch_data?auth_token=" + auth_token;        
        $.ajax({
            url: url,
            type: 'get',
            async: false,
            success: function(response, msg) {
              	console.log(msg);
				var totalContents = ds.get('total_contents');
				ds.set('total_contents',totalContents+1);
				ds.get('queryDataSource').then(function(qds){
					qds.reload();
				});
				ds.reload();
              	obj.set('data_loading', false);
            },
            error: function(req, msg, err) {
              	console.log(req.responseJSON.message);
              	obj.set('data_loading', false);
            }
        });	
	},

});

