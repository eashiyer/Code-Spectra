Cibi.VerticalsNewView = Ember.View.extend({
	didInsertElement: function(){
		var obj = this;
		//var model = obj.get('controller').get('controllers').get('verticals').get('content');
	      $('#iconUpload').change(function(e){
				var reader = new FileReader();
		        reader.onload = function (e) {
		            var fileToUpload = e.target.result;
		            $("#icon-preview").attr('src',fileToUpload)
		            Ember.run(function() {
		                obj.set('customIcon', fileToUpload);
		            });            
		        };
		        return reader.readAsDataURL(e.target.files[0]);
	      }); 
	},

	submit: function(e) {
		e.preventDefault();
		var vertical = {};
		vertical.name = this.get('verticalName');
		vertical.description = this.get('verticalDescription');
		vertical.iconType = this.get('iconType');
		vertical.customIcon = this.get('customIcon');
		vertical.accountId = Cibi.Auth.get('currentUser').get('account').get('id');
		this.set('verticalName', "");
		this.get('controller').send('createVertical', vertical);
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

