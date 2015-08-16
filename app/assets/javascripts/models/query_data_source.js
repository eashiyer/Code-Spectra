/**
@class Cibi.QueryDataSource
*/

/**
  `Cibi.QueryDataSource` is the `QueryDataSource` model

  A QueryDataSource has following attributes:

  `query, frequency, lastRunAt, enabled, dataSourceId, dataconnectionId`


  @class Cibi.QueryDataSource
*/
Cibi.QueryDataSource = DS.Model.extend({
	query: DS.attr('string'),
	frequency: DS.attr('number'),
	lastRunAt: DS.attr('string'),
	enabled: DS.attr('boolean'),
	dataSourceId: DS.attr('number'),
	dataConnectionId: DS.attr('number'),
	importType: DS.attr('number'),
	bookmarkKey: DS.attr('string'),
	bookmarkComparisonOperator: DS.attr('string'),
	last_run_successful: DS.attr('boolean'), 
	last_run_status: DS.attr('string'),
	createdAt: DS.attr('date'),	
	unsuccessfullCount: DS.attr('number'),
});