Cibi.AccountTemplate = DS.Model.extend({

	accountId: DS.attr('number'), 
	status: DS.attr('number'), 
	templateInputs: DS.attr('string'), 
	templateName: DS.attr('string'),

	account: DS.belongsTo('Cibi.Account'),
	dataSources: DS.hasMany('Cibi.DataSource'),
	workspaces: DS.hasMany('Cibi.Vertical'),
	dashboards: DS.hasMany('Cibi.Dashboard'),
	charts: DS.hasMany('Cibi.Chart'),
	dimensions: DS.hasMany('Cibi.Dimension'),
	measures: DS.hasMany('Cibi.Measure'),
	chartsDataSources: DS.hasMany('Cibi.ChartsDataSource'),

});