Cibi.QueryDataSourceView = Ember.View.extend({
	templateName: 'query_data_source',
	enabled: true,

	bookmarkComparisonOperators: ["<", ">"],
	importTypes: [{label:"Overwrite existing data", value:1},{label:"Append to existing data", value:2}],

	isAppendTo: function(){
		if(this.get('import_type') == 2){
			return true;
		}
	}.property('import_type'),

	getImportTypeLabel: function(){
		if(this.get('import_type')==1){
			return "Overwrite existing data";
		}
		else if(this.get('import_type')==2){
			return "Append to existing data";
		}
	}.property('import_type'),

	init: function() {
		var controller = this.get('controller');
    	var qds = controller.get('queryDetails');
		if(qds){
			this.set('isDisabled', true);
			this.set('data_connection_id', qds.data_connection_id)
			this.set('query', qds.query);
			this.set('frequency', qds.frequency);
			this.set('disable', !(qds.enabled));
			this.set('import_type', qds.import_type);
			this.set('bookmarkKey', qds.bookmark_key);
			this.set('bookmarkComparison', qds.bookmark_comparison);
			var ds=controller.get('content');
			var uniqueStr=JSON.parse(ds.get('uniqueStr'));
			if(uniqueStr){
				this.set('uniqueKey', uniqueStr[0]);	
			}			
			// $("input[name='import_type'][value='"+ this.get('import_type') +"']").attr('checked', 'checked');			
		}
		else{
			this.set('isDisabled', false);
			this.set('data_connection_id', 1);
			this.set('query', "");
			this.set('frequency', 10);
		}
	}.observes('controller.queryDetails'),

	saveQuery: function() {
		var obj=this;
		obj.get('controller').set("data_loading", true);
		var query=obj.get('query');
		var impType=obj.get('import_type') || $("#query_ds_import_type_id").val();
		if(impType==1 && query.indexOf("$$CIBI_BOOKMARK_CONDITION")!=-1){
			var div=$(".qds_info_message");
			div.html("<p>Please check the query. $$CIBI_BOOKMARK_CONDITION not allowed for overwrite option.</p>");
			div.css("visibility","visible");
	        setTimeout(function(){		        	
	            obj.set('query',query);
		        div.html("");
	            div.css("visibility", "hidden");
	        },5000);
	        obj.get('controller').set('data_loading', false);
			return false;
		}
		var index=query.length-1;
		if(query.charAt(index)==";")
		{
			query=query.substr(0, index);
		}
		var uniqueKeysArr=[];
		var uniqueKey=$("#query_ds_unique_key_id").val();
		if(uniqueKey){
			uniqueKeysArr.push(uniqueKey);	
		}		
		var queryDataSource = {};
		queryDataSource.dataConnectionId = obj.get('connection') || $("#query_ds_conn_id").val();
		queryDataSource.query = query;
		queryDataSource.frequency = obj.get('frequency');
		queryDataSource.enabled = !(obj.get('disable'));
		queryDataSource.dataSourceId = obj.get('controller').get('id');
		queryDataSource.importType = impType;
		// queryDataSource.importType = $("input[name='import_type']:checked").val();
		queryDataSource.bookmarkKey = obj.get('bookmarkKey');
		queryDataSource.bookmarkComparisonOperator = obj.get('bookmarkComparison');
		obj.set('QDS', queryDataSource);
		var jsonArr=[];
		var qds = obj.get('controller').get('queryDataSource');
		if(!qds) {
			qds = Cibi.QueryDataSource.createRecord(queryDataSource);
			qds.on("didCreate",function(q){
				var div=$(".qds_info_message");
				div.html("<p>Saved successfully!</p>");
				div.css("visibility","visible");
		        setTimeout(function(){		        	
		            obj.set('query',query);
			        obj.set('data_connection_id', queryDataSource.dataConnectionId);
			        obj.set('frequency', queryDataSource.frequency);
			        obj.set('disable', !(queryDataSource.enabled));
			        obj.set('isDisabled',true);
			        obj.set('uniqueKey', uniqueKey);
			        div.html("");
		            div.css("visibility", "hidden");
		        },2000);        
			});			
			qds.get('transaction').commit();	
			var jsonArr=[];
			// var fieldsArr=[];
			var ignored_keys = [];
			// console.log(obj);
			$(".previewFields").each(function() {
				var json={};            
	            // var field={};
	            // field["fieldName"]=$(this).find('label').text().trim();
	            // field["fieldType"]=$(this).find('.data_type').val();
	            // field["defaultValue"]=$(this).find('.default_value').val() || null;
	            // fieldsArr.push(field);
			   	// console.log(json);
	          	var options = {};
	          	options['date_format'] = $(this).find('.date_format').val();
	          	options['time_format'] = $(this).find('.time_format').val();
				options['max_digits'] = $(this).find('.max_digits').val();
				options['max_decimals'] = $(this).find('.max_decimals').val();
				options['string_length'] = $(this).find('.string_length').val();
	          	var ignored = $(this).find('.ignored').is(':checked');
	          	if(ignored){
	          		var key=$(this).find('label').text().trim();
	          		ignored_keys.push(key);
	          	} else {
	          		json["name"]=$(this).find('label').text().trim();
					json["display_name"] = $(this).find('label').text().trim();
		            json["data_type"] = $(this).find('.data_type').val();
		            json["options"] = JSON.stringify(options);
		            json["default"] = $(this).find('.default_value').val() || null;
		          	jsonArr.push(json);
	          	}  
			});
			this.set('isDisabled', true);
			obj.get('controller').send('createTable', jsonArr, uniqueKeysArr, ignored_keys);
		}
		else{
			qds.setProperties(queryDataSource);
			qds.on("didUpdate", function(){
				var div=$(".qds_info_message");
				div.html("<p>Saved successfully!</p>");
				div.css("visibility","visible");
		        setTimeout(function(){
		        	div.html("");
		            div.css("visibility", "hidden");
		        },2000);
			});
			qds.get('transaction').commit();
		}
		obj.get('controller').set('data_loading', false);		
	},

	connections: function () {
		var data_source = this.get('controller').get('content');
		if(!data_source) {
			return [];
		}
		var data_source_type = data_source.get('dataSourceType');
		var connections = Cibi.DataConnection.find({connection_type: data_source_type});
		return connections;
	}.property('controller.content'),

	previewResults: function(){
		var controller=this.get('controller');
		controller.set("data_loading", true);
		var query = this.get('query');
		var index=query.length-1;
		if(query.charAt(index)==";")
		{
			query=query.substr(0, index);
		}
		var dataConnectionId = this.get('connection') || $("#query_ds_conn_id").val();		
		controller.send("previewResults", query, dataConnectionId);
	},

	previewResultsView: Em.View.extend({
		didInsertElement: function() {
        	var obj=this;
        	obj.render_results();
        },

        render_results: function(){
        	var obj=this;
        	var elem=obj.get('elementId');
        	var html="";
        	var res=obj.get('controller').get('preview_results');
        	if(res && res.length >0){
        		uniqueKeys=[];
        		html+="<table class='table table-bordered'>";
        		var head=res[0];
        		html+="<tr>";
        		_.each(head, function(value, key){
        			uniqueKeys.push(key);
	                html+="<th>"+key+"</th>";
	            });
	            html+="</tr>";
	            _.each(res,function(d){
	            	html+="<tr>";
		            _.each(d, function(value, key){
		            	html+="<td>"+value+"</td>";
		            });
		            html+="</tr>";
		        });
        		html+="</table>";
        		$("#"+elem).html(html);
        		obj.get('controller').set('keyFields', uniqueKeys);
        	}
        }.observes('controller.preview_results'),
	}),

	previewFieldsView: Em.View.extend({
		templateName: 'fields_preview',

		fields: function(){
			var obj=this;
			if(obj.get('controller').get('preview_results')){
				var res=obj.get('controller').get('preview_results')[0];
				return Object.keys(res);	
			}else{
				return null;
			}			
		}.property('controller.preview_results'),

		previewFieldView: Em.View.extend({
			templateName: 'field_preview',

			datatypes: [
			    {label: "String", value: "varchar"},
			    {label: "Text", value: "text"},
			    {label: "LongText", value: "longtext"},
		    	{label: "Integer",    value: "int"},
		    	{label: "Decimal",    value: "decimal"},
		    	{label: "Boolean", value: "boolean"},
		    	{label: "Date", value: "date"},
		    	{label: "DateTime", value: "datetime"},
		    	{label: "Time", value: "time"},
		  	],

		  	date_formats: ['Month, Day, Year','Day, Month, Year','Year, Month, Day'],

		  	time_seperators: [':', 'space'],

		  	time_formats_colon: ['hh:mm', 'hh:mm AM/PM', 'hh:mm:ss', 'hh:mm:ss AM/PM'],	 	  	  	

	  		time_formats_space: ['hh mm', 'hh mm AM/PM', 'hh mm ss', 'hh mm ss AM/PM'],

	  		date_seperators: ['-', '/'],

		  	varchar: function(){
	  			return this.data_type == 'varchar'
	  		}.property('data_type'),

	  		decimal: function(){
		  		return this.data_type == 'decimal'
		  	}.property('data_type'),

		  	date: function(){
		  		return this.data_type == 'date'
		  	}.property('data_type'),

		  	time: function(){
		  		return this.data_type == 'time'
		  	}.property('data_type'),

		  	colon_format: function(){
		  		var field_name = this.get('content');
		  		var value = this.get('controller').get('preview_results')[0][field_name];	  		
		  		flag = (value.indexOf(':') != -1) ? true : false;
		  		return flag;
		  	}.property(''),

		  	datetime: function(){
		  		return this.data_type == 'datetime'
		  	}.property('data_type'),

		  	valid_date_separator: function(){
		  		value = this.get_first_value();
		  		flag = (value.indexOf('-') != -1) ? true : (value.indexOf('/') != -1) ? true : false;
		  		return flag;
		  	}.property(''),

		  	no_options: function(){
		  		return ['int','text','longtext','boolean'].contains(this.data_type);
		  	}.property('data_type'),

		  	get_first_value: function(){
	 		  	var field_name = this.get('content');
		  		var value = this.get('controller').get('preview_results')[0][field_name];	  		
		  		return value;
		  	},
		}),

	}),
	
});