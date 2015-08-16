/**
  Sometimes, you may use the same HTML in your application multiple times. In those case, you can register a custom helper that can be invoked from any Handlebars template.
  
  This is a custom Handlebars helper which formats money by calling formatMoney prototype method defined in `util.js`

		Ember.Handlebars.registerHelper('money', function (accr) {
			var amount = this[accr];
			return amount.formatMoney();
		});

  Anywhere in your Handlebars templates, you can now invoke this helper as:
	
		{{ money param}}
  
  @method money
  @for Ember.Handlebars.helpers
  @param {String} accessor
  @return {String} HTML string
*/
Ember.Handlebars.registerHelper('money', function (accr) {
	var amount = this[accr];
	return amount.formatMoney();
});


