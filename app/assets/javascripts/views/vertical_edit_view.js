Cibi.VerticalEditView = Ember.View.extend({
	didInsertElement: function(){
		var obj = this;
		var model = obj.get('controller').get('controllers').get('vertical').get('content');
		obj.set('customIcon', null)
		$("#icon-preview").attr('src', model.get('iconUrl'));
		//var model = obj.get('controller').get('controllers').get('verticals').get('content');
	      $('#iconUpload').change(function(e){
				var reader = new FileReader();
		        reader.onload = function (e) {
		            var fileToUpload = e.target.result;
		            $("#icon-preview").attr('src',fileToUpload)
		            Ember.run(function() {
		                obj.set('customIcon', fileToUpload);
		                obj.set('iconType', null);
		            });            
		        };
		        return reader.readAsDataURL(e.target.files[0]);
	      }); 
	},

	verticalName: function(){
		var model = this.get('controller').get('controllers').get('vertical').get('content');
		return model.get('name')
	}.property(''),

	verticalDescription: function(){
		var model = this.get('controller').get('controllers').get('vertical').get('content');
		return model.get('description')
	}.property(''),

	iconUrl: function(){
		var model = this.get('controller').get('controllers').get('vertical').get('content');
		if(model.get('customIcon') && model.get('customIcon') != "/custom_icons/original/missing.png"){
			return model.get('customIconUrl')
		}else{
			var icon = model.get('iconType') !== null ? model.get('iconType') : "folder"
			return "assets/" + icon + ".png"
		}
	}.property('customIcon','customIconUrl'),	

	submit: function(e) {
		e.preventDefault();
		var obj = this;
		var vertical = this.get('controller').get('controllers').get('vertical').get('content');
		vertical.set('name',this.get('verticalName'));
		vertical.set('description',this.get('verticalDescription'));
		vertical.set('customIcon',this.get('customIcon'));
		if(this.get('iconType')){
			vertical.set('customIcon',null);
			vertical.set('iconType',this.get('iconType'));
		}				
		vertical.on('becameInvalid',function(errors){
			this.transaction.rollback();
			obj.set('errors',errors.errors.name);
		});

		vertical.on('didUpdate',function(){		
			//obj.get('controller').transitionToRoute('vertical', vertical)
		});		
		
	    vertical.get('store').commit();
	},

	accountTopNavColor: function(){
		var currentUser = Cibi.Auth.get('currentUser');
    	if(currentUser){
      		var dbarColor = currentUser.get('get_dashboard_color');
    	}		
		if(dbarColor != undefined){
			if(currentUser.get('dashboardBarColor') != undefined){
				dbarColor = currentUser.get('dashboardBarColor');
			}
			dbarColor = "background-color:"+dbarColor+";";
		}
		return dbarColor;
	}.property('Cibi.Auth.currentUser.isLoaded'),

	iconTypesView: Ember.View.extend({
		template: Ember.Handlebars.compile("{{partial 'verticals/iconTypes'}}"),

		click: function(e) {
			var elem = e.target;
			if(elem.nodeName.toLowerCase() === 'button') {
				this._parentView.set('iconType', elem.value);
				$("#icon-preview").attr('src','assets/'+elem.value+'.png')
			} else if ( elem.nodeName.toLowerCase() === "img") {
				this._parentView.set('iconType', elem.parentElement.value);
				$("#icon-preview").attr('src','assets/'+elem.parentElement.value+'.png')
			}	
			$('#iconUpload').val('');	
			this._parentView.set('customIcon', null)	
		},
	}),	

});

