Cibi.Account = DS.Model.extend({
	name: DS.attr('string'),
	accountType: DS.attr('string'),
	adminUsersLimit: DS.attr('number'),
	basicUsersLimit: DS.attr('number'),
	dataSourcesLimit: DS.attr('number'),
	verticalsLimit: DS.attr('number'),
	timeLimit: DS.attr('date'),

	users: DS.hasMany('Cibi.User'),
	accountTemplates: DS.hasMany('Cibi.AccountTemplate'),
	accountSetting: DS.belongsTo('Cibi.AccountSetting'),

});