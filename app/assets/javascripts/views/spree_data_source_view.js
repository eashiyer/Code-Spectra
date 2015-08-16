Cibi.SpreeDataSourceView = Ember.View.extend({
	templateName: 'spree_data_source',

	importOptions: [{ name: 'Sales', key: 'sales'}],

	storeName: function(){
		var obj = this;
		var sds = obj.get('controller').get('content').get('spreeDataSource')
		if(sds){
			return sds.get('storeName');	
		}		
	}.property('this.controller.content.spreeDataSource.isLoaded'),

	storeUrl: function(){
		var obj = this;
		var sds = obj.get('controller').get('content').get('spreeDataSource')
		if(sds){
			return sds.get('storeUrl');	
		}
	}.property('this.controller.content.spreeDataSource.isLoaded'),

	apiToken: function(){
		var obj = this;
		var sds = obj.get('controller').get('content').get('spreeDataSource')
		if(sds){		
			return sds.get('apiToken');	
		}
	}.property('this.controller.content.spreeDataSource.isLoaded'),

	frequencyOfImport: function(){
		var obj = this;
		var sds = obj.get('controller').get('content').get('spreeDataSource')
		if(sds){		
			return sds.get('frequencyOfImport');	
		}
	}.property('this.controller.content.spreeDataSource.isLoaded'),

	importType: function(){
		var obj = this;
		var sds = obj.get('controller').get('content').get('spreeDataSource')
		if(sds){		
			return sds.get('importType');	
		}
	}.property('this.controller.content.spreeDataSource.isLoaded'),	

	enabled: function(){
		var obj = this;
		var sds = obj.get('controller').get('content').get('spreeDataSource')
		if(sds){		
			return sds.get('enabled');	
		}
	}.property('this.controller.content.spreeDataSource.isLoaded'),		

	modelExist: function(){
		var obj = this;
		var sds = obj.get('controller').get('content').get('spreeDataSource')
		if(sds){		
			return true;	
		}else{
			return false
		}
	}.property('this.controller.content.spreeDataSource.isLoaded'),

	submit: function(e){
		e.preventDefault();
		var obj = this;
		if(!obj.get('storeName')){
			$('#store_name_control_grp').addClass('error');
			return
		}else{$('#store_name_control_grp').removeClass('error');}

		if(!obj.get('storeUrl')){
			$('#store_url_control_grp').addClass('error');
			return
		}else{$('#store_url_control_grp').removeClass('error');}

		if(!obj.get('apiToken')){
			$('#api_token_control_grp').addClass('error');
			return
		}else{$('#api_token_control_grp').removeClass('error');}
		
		var spreeDataSource = {};
				spreeDataSource.storeName = obj.get('storeName');
				spreeDataSource.frequencyOfImport = obj.get('frequencyOfImport');
				spreeDataSource.storeUrl = obj.get('storeUrl');
				spreeDataSource.dataSourceId = obj.get('controller').get('id');
				spreeDataSource.apiToken = obj.get('apiToken');
				spreeDataSource.importType = obj.get('importType');
				spreeDataSource.enabled = obj.get('enabled');

				var sds = obj.get('controller').get('spreeDataSource');
				if(!sds) {
					sds = Cibi.SpreeDataSource.createRecord(spreeDataSource);
					sds.on("didCreate",function(s){
						obj.set('modelExist', true);
						obj.get('controller').get('content').reload();
        				var div=$(".sds_info_message");
						div.html("Created successfully.");
						div.toggle();
				        setTimeout(function(){		        	
					        div.html("");
				            div.toggle();
				        },2000);  
					});												
				}else{
					sds.setProperties(spreeDataSource);
					sds.on("didUpdate", function(){
        				var div=$(".sds_info_message");
						div.html("Updated successfully.");
						div.toggle();
				        setTimeout(function(){		        	
					        div.html("");
				            div.toggle();
				        },2000);  
					});
				}
			sds.get('transaction').commit();
	},
});