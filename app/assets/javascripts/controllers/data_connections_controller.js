Cibi.DataConnectionsController = Ember.ArrayController.extend({

	testConnection: function(dc){
		var obj=this;
		if(dc){
			var auth_token = Cibi.Auth.get('authToken');
			var id=dc.get('id');
	        var url="/data_connections/"+id+"/test_connection?auth_token=" + auth_token;        

	        $.ajax({
	                url: url,
	                type: 'post',
	                async: false,
	                success: function(response, msg){
	                  	dc.set("connectionStatus", response);
	                  	var div=$("."+dc.get('connectionInfoClass'));
						div.css("visibility","visible");
				        setTimeout(function(){
				            div.css("visibility", "hidden");
				        },2000);
	                },
	                error: function(req, msg, err) {
	                  	obj.set("preview_error", req.responseJSON.message);
	                  	obj.set('data_loading', false);
	                }
	        });	
		}
	},

	deleteConnection: function(dc){
		var obj=this;
		var r = confirm("Are you sure you want to delete this data-connection?");
		if (r === true) {
			dc.deleteRecord();
			var ds = this.get('content');
			dc.on('didDelete', function() {
				// ds.reload();	
			});
			dc.on('becameInvalid',function(errors){
				obj.set('errors',errors.errors.message);
			});
			var store = dc.get('store');
			store.commit();
		}
	}
});