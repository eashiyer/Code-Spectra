Cibi.VerticalsRoute = Em.Route.extend({
	model: function(params, transition) {
		if(Cibi.Auth.get('signedIn')) {
			return Cibi.Vertical.find();	
		}
	},	
});

Cibi.VerticalsIndexRoute = Cibi.AuthorizedRoute.extend({
	redirect: function() {
		if(Cibi.Auth.get('signedIn'))
		{
			var verticals = this.controllerFor('verticals').get('content');
			if(typeof verticals !== undefined && verticals.get('isLoaded')) {
				var first_vertical = verticals.get('firstObject');
				if(typeof first_vertical !== "undefined") {
					
					this.transitionTo('vertical', first_vertical);
				}
			}	
		}		
	},
});

