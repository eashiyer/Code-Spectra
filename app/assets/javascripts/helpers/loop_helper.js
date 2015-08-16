/**
  Sometimes, you may use the same HTML in your application multiple times. In those case, you can register a custom helper that can be invoked from any Handlebars template.
  
  This is a custom Handlebars helper which loops over the passed value

		Handlebars.registerHelper('times', function(accessor, block) {
   			var accum = '';
    		for(var i = 0; i < this[accessor]; ++i)
        		accum += block.fn(i);
		});

  Anywhere in your Handlebars templates, you can now invoke this helper as:
	
		{{ times param}}
  
  @method times
  @for Ember.Handlebars.helpers
  @param {String} accessor
  @param {String} block
  @return {String} HTML string
*/
Handlebars.registerHelper('times', function(accessor, block) {
	
    var accum = '';
    for(var i = 0; i < this[accessor]; ++i)
        accum += block.fn(i);
    
});