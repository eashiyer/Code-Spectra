Cibi.AccountSettingsAccountTemplatesView = Ember.View.extend({
	didInsertElement: function(){
		console.log(this);
		var elem = $("#" + this.get('elementId'));
		elem.find("#available_template_input").fastLiveFilter(elem.find("#available_template_list"));
		var templateInputs={};
		this.set('templateInputs', templateInputs);

		// elem.find(".chosen-select").chosen();
	},

	isSpreeCommerceTemplate: function(){
		if(this.selectedTemplate=="Spree Commerce")
			return true;
	}.property('selectedTemplate'),

	applyTemplate: function(){
		var obj=this;
		console.log(obj);
		var elem = $("#" + this.get('elementId'));
		var templateInputs=obj.get('templateInputs');
		var templateInputControls=elem.find(".control-group.template-inputs");
		if(Object.keys(templateInputs).length >= templateInputControls.length){
			templateInputControls.removeClass('error');
			var nullEntries=false;
			_.each(templateInputs, function(value, key){
				if(!value || value==""){
					elem.find("#"+key+"_ctrl_grp").addClass('error');
					nullEntries=true;
					return false;
				}else{
					elem.find("#"+key+"_ctrl_grp").removeClass('error');
				}
			});	
			if(nullEntries){
				return;
			}
		}else{
			templateInputControls.addClass('error');
			return;
		}
		var account=Cibi.Auth.get('currentUser').get('account');
		var acc_templ = {};
		acc_templ.accountId=account.get('id');
		acc_templ.templateName=obj.selectedTemplate;
		acc_templ.templateInputs=JSON.stringify(templateInputs);
		acc_templ.status=1;

		var data = {'accountTemplate' : acc_templ};
		var account_template = Cibi.AccountTemplate.createRecord(acc_templ);
		account_template.set('account', account);
		account_template.on('didCreate', function(a) {
    		// var accountTemplates = Cibi.AccountTemplate.find({account_id: account.get('id')});
      		// Cibi.Auth.set('accountTemplates', accountTemplates);
      		obj.set('successMessage', "Template created & applied successfully!");
		    setTimeout(function() {
				obj.set('successMessage', false);
			}, 5000);
    	});
		account_template.on('becameInvalid', function(errors) {
	  		// # record was invalid
	  		this.transaction.rollback();
		    obj.set('noticeMessage', errors.errors.templateName);
		    setTimeout(function() {
				obj.set('noticeMessage', false);
			}, 5000);
  		});

		account_template.get('transaction').commit();
	},

	deleteTemplate: function(template){
		var obj = this,
		r = confirm("Are you sure you want to delete this template?");
		if (r === true) {
			var account=Cibi.Auth.get('currentUser').get('account');
			
			var dataSources = template.get('dataSources');
			var verticals = template.get('workspaces');
			// var dashboards = template.get('dashboards');
			// var charts = template.get('charts');				
			// var chartsDataSources = template.get('chartsDataSources');
			// var dimensions=template.get('dimensions');
			// var measures=template.get('measures');
			var transaction = template.get('transaction');
			template.deleteRecord();
			// if(store) {
			// 	dataSources.forEach(function(ds){
			// 		ds.unloadRecord();	
			// 	});
			// 	verticals.forEach(function(v){
			// 		v.unloadRecord();	
			// 	});
			// 	dashboards.forEach(function(d){
			// 		d.unloadRecord();	
			// 	});
			// 	charts.forEach(function(c){
			// 		c.unloadRecord();	
			// 	});
			// 	chartsDataSources.forEach(function(cds){
			// 		cds.unloadRecord();	
			// 	});
			// 	dimensions.forEach(function(dim){
			// 		dim.unloadRecord();
			// 	});
			// 	measures.forEach(function(mes){
			// 		mes.unloadRecord();
			// 	});
			// }
			template.on('didDelete', function(){				
				obj.set('successMessage', "Template deleted successfully! Refreshing your app.");
				obj.set('noticeMessage', "Please Wait!");
			    setTimeout(function() {
					window.location.reload();
				}, 1500);
				// console.log(this);

				// var controller = obj.get('controller'),
				// verticals_controller = controller.get('controllers').get('verticals'),
				// data_sources_controller = controller.get('controllers').get('dataSources');
				// verticals_controller.set('model', Cibi.Vertical.find());
				// data_sources_controller.set('model', Cibi.DataSource.find());

				// var accountTemplates = Cibi.AccountTemplate.find({account_id: account.get('id')});
    //       		Cibi.Auth.set('accountTemplates', accountTemplates);
          		
			});
			transaction.commit();
		}
	}
});