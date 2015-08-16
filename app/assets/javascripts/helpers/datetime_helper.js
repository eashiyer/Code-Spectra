/**
  Sometimes, you may use the same HTML in your application multiple times. In those case, you can register a custom helper that can be invoked from any Handlebars template.
  
  This is a custom Handlebars helper which converts the javascript date into human readable format.

		Ember.Handlebars.registerHelper('humanDate', function (accr) {
			var datetime = this.get(accr);
			if(!datetime) {
				return "";
			}
			var timestamp = new Date(datetime);
			var date = $.datepicker.formatDate('yy M dd ', timestamp);
			var time = timestamp.getHours() + ":" + timestamp.getMinutes()
			return date + " " + time;
		});

  Anywhere in your Handlebars templates, you can now invoke this helper as:
	
		{{ humanDate date}}
  

  @method humanDate
  @for Ember.Handlebars.helpers
  @param {String} date  
  @return {String} HTML custom formatted date
*/
Ember.Handlebars.registerHelper('humanDate', function (accr) {
	var datetime = this.get(accr);
	if(!datetime) {
		return "";
	}
	var timestamp = new Date(datetime);
	var date = $.datepicker.formatDate('yy M dd ', timestamp);
	var time = timestamp.getHours() + ":" + timestamp.getMinutes()
	return date + " " + time;
});

