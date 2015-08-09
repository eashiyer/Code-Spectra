Cibi.AccountSettingsAccountTemplatesController = Ember.ObjectController.extend({
	needs: ['verticals', 'dataSources'],
	accountTemplates: function(){
		// return Cibi.Auth.get('accountTemplates');	
		var currentUser = Cibi.Auth.get('currentUser');
		if(!currentUser) {
			return [];
		}
		var account = currentUser.get('account');
		if(!account) {
			return [];
		}

		return account.get('accountTemplates');		
	}.property('Cibi.Auth.currentUser.account.accountTemplates'),

	availableTemplates: function(){
		var templates=['Spree Commerce', 'Asana', 'Shopify'];
		return templates;
	}.property(''),
});