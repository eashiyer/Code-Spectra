Cibi.AccountSettingsIndexView = Ember.View.extend({
	timezonesArr: ['UTC', 'GMT'],
	monthsArr: [  {id: 1, name: 'Jan'},
				    {id: 2, name: 'Feb'},
				    {id: 3, name: 'Mar'},
				    {id: 4, name: 'Apr'},
				    {id: 5, name: 'May'},
				    {id: 6, name: 'Jun'},
				    {id: 7, name: 'Jul'},
				    {id: 8, name: 'Aug'},
				    {id: 9, name: 'Sep'},
				    {id: 10, name: 'Oct'},
				    {id: 11, name: 'Nov'},
				    {id: 12, name: 'Dec'},
				  ],

	  numberFormats: ['No Units', 'k, M, B', 'k, L, Cr', 'Only Lakhs', 'Only Crores', 'Only Millions', 'Only Billions'],
	  currencies: ['USD','INR','EURO'],	  

	daysArr: function(){
	  	var arr = [];
		for (var i = 1; i <= 31; i++) {
		   arr.push(i);
		}
		return arr;
	}.property(''),

    logoUrl: function(){
		return Cibi.Auth.get('currentUser').get('get_company_logo_url')
	}.property('Cibi.Auth.currentUser.isLoaded'),

	logoDims: function(){
	  	var obj = this;
	  	width = obj.get('controller').get('content').get('logoWidth');
	  	height = '50'
	  	return "width:"+width+"px;height:"+height+"px;"
	}.property('controller.content.logoWidth'),

	changeTopbarColor: function(){
    	var current_user = Cibi.Auth.get('currentUser');
    	if(current_user){
      		return current_user.get('get_top_bar_color');
    	}
  	}.property('Cibi.Auth.currentUser.isLoaded'),  	

	submit:function(e){
		e.preventDefault();
		var obj=this;
		var currentUser = Cibi.Auth.get('currentUser');
		var globalSetting = Cibi.Auth.get('globalSetting');
		content = obj.get('controller').get('content');
		content.set('logoWidth', obj.$('.resizable').width());
		
		// var old_workspaceColor = content.get('data').attributes.workspaceColor;
		
		var acc = {};
		acc.account=Cibi.Auth.get('currentUser').get('account');		

		var account_setting = Cibi.AccountSetting.createRecord(acc);
		account_setting.on('becameInvalid', function(errors) {
	  		this.transaction.rollback();
		    obj.set('noticeMessage',errors.errors.name);
			});
		account_setting.on('didCreate', function(res) {
			new_logo = content.get('companyNewLogo');
			    if(new_logo){
			    	$(".brand-image").attr('src',new_logo);			    	
			    }
			    $(".brand-image").css('width',obj.$('.resizable').width());
			    var collpase_navbar = content.get('collapseNavbar');

			    var new_topbarColor = content.get('topBarColor');
			    $("#top-nav-bar").css('background-color',new_topbarColor);
				
				var new_dashboardBarColor = content.get('dashboardBarColor');
				$("#account-settings").css('background-color',new_dashboardBarColor);
				var new_workspaceColor = content.get('workspaceColor');
				
				currentUser.set('topbarColor',new_topbarColor);
				currentUser.set('dashboardBarColor',new_dashboardBarColor);
				currentUser.set('workspaceColor',new_workspaceColor);
				globalSetting.set('shrinkNavbar', collpase_navbar);
			});
			

			// if(new_WorkspaceColor != content)		
		account_setting.get('transaction').commit();
	},

	didInsertElement: function() {
		var obj = this;
		var model = obj.get('controller').get('content');
		var user_id = Cibi.Auth.get('currentUser').id;
		var auth_token = Cibi.Auth.get('authToken');
		var url = '/account_settings/upload_logo?user_id='+ user_id +'&auth_token=' + auth_token;
	      $('#logoUpload').change(function(e){
				var reader = new FileReader();
		        reader.onload = function (e) {
		            var fileToUpload = e.target.result;
		            $("#preview").attr('src',fileToUpload)
		            Ember.run(function() {
		                model.set('companyNewLogo', fileToUpload);
		            });            
		        };
		        return reader.readAsDataURL(e.target.files[0]);
	      }); 

	      $(".resizable").resizable({
 				      		maxHeight: 50,
     						maxWidth: 184,
     						minHeight: 50,
     						minWidth: 50
     		});


	    // $('#logoUpload').fileupload({
	    //   url: url,
	    //   add: function(e, data) {
	    //     	data.submit()
					// .success(function(req, msg) {
					// 	$(".brand-image").attr('src', req['url']);
					// })
					// .error(function(req, msg, err) {
					// 	data.context = $('<p/>').text('Error uploading image...');											
					// })
					// .complete(function() {

					// });        
	    //   },
	    //   done: function(e, data) {
	        
	    //   }
	    // });
	},

	removeLogo: function(){
		var user_id = Cibi.Auth.get('currentUser').id;
		var auth_token = Cibi.Auth.get('authToken');
		var url = '/account_settings/remove_logo?user_id='+ user_id +'&auth_token=' + auth_token;
        req = $.ajax({
            url: url,
            type: 'post',
            data: {},
            async: false,
            success: function(req, msg) {
            	$(".brand-image").attr('src', req['url']);
            },
            error: function(req, msg, err) {},
            complete: function() {}
        });
	},


});