Ember.Handlebars.helper('time_ago', function(date) {
	var date = date;
	if(date){
		var current_date = new Date;
		var diff =  Math.ceil(( Date.parse(current_date) - Date.parse(date) ) / 86400000);
		if(diff < 2){
			return $.timeago(formatDateLong(date));
		}else{		 
			return "on " + d3.time.format("%d %b %Y %I:%M %p")(date)
		}
	}	
});