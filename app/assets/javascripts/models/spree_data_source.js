
Cibi.SpreeDataSource = DS.Model.extend({
	storeName: DS.attr('string'),
	storeUrl: DS.attr('string'),
	apiToken: DS.attr('string'),
	frequencyOfImport: DS.attr('number'),
	dataSourceId: DS.attr('number'),
	importType: DS.attr('string'),
	enabled: DS.attr('boolean'),
	createdAt: DS.attr('date'),
	lastRunAt: DS.attr('string'),
});