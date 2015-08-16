Cibi.AccountSetting = DS.Model.extend({
	timezone: DS.attr('string'),
	numberFormat: DS.attr('string'),
	currency: DS.attr('string'),
	fiscalYearStartDay: DS.attr('number'),
	fiscalYearStartMonth: DS.attr('number'),
	accountId: DS.attr('number'),
	topBarColor: DS.attr('string'), 
	workspaceColor: DS.attr('string'),
	dashboardBarColor: DS.attr('string'),
	companyLogo: DS.attr('string'),
	companyNewLogo: DS.attr('string'),
	logoWidth: DS.attr('number'),
	collapseNavbar: DS.attr('boolean'),

	//users: DS.hasMany('Cibi.User'),
	account: DS.belongsTo('Cibi.Account'),

});