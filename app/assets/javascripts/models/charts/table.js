

Cibi.Table = Ember.Object.extend({

	draw: function() {
		var obj = this;

        var cds = obj.cds.objectAt(0);
		$("#" + obj.element).html("");
		obj.chart.set("isSetup", true);
		var width = obj.chart.get('width') ;
		var height = obj.chart.get('height');
		var grid_id = obj.element;

		var col_names = [];
		obj.chart.get('measures').forEach(function(d){
			col_names.push(d.get('fieldName'));
		});

		html = "";
		html += "<div id='" + grid_id + "' style=\"width:"+width+"px;height: "+height+"px;overflow:auto;\">"
		html += "<table id='table-"+obj.element+"'class='display compact' cellspacing='0' width='"+width+"px;'>"
	    html +=     "<thead>"
	    html +=         "<tr>"
	    for(var i = 0; i < col_names.length; i++ ) {
	    	html +=             "<th>"+col_names[i]+"</th>"
		}
	    html +=         "</tr>"
	    html +=     "</thead>"
	 
	    html +=     "<tfoot>"
	    html +=         "<tr>"
	    for(var i = 0; i < col_names.length; i++ ) {
	    	html +=             "<th>"+col_names[i]+"</th>"
		}
	    html +=         "</tr>"
	    html +=     "</tfoot>"
	    html += "</table>"
	    html += "</div>"

		$("#" + obj.element).html(html);	

		var auth_token = Cibi.Auth.get('authToken');	
		var url_str = '/charts_data_sources/'+ cds.id +'/chartData?auth_token=' + auth_token;
		
	    $('#table-'+obj.element).dataTable( {
	        "processing": true,
	        "serverSide": true,
	        "sDom":'<"top"l>rt<"bottom"ip><"clear">',
	        "ajax": url_str
	    } );		
	},
});	

