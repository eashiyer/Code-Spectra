/**
@class Cibi.DataConnection
*/

/**
  `Cibi.DataConnection` is the `DataConnection` model

  A DataConnection has following attributes: 

  `displayName, host, dbname, username, password, port, socket, useSsl, queryDuration, connectionType, connectionStatus`

  @class Cibi.DataConnection
*/
Cibi.DataConnection = DS.Model.extend({
	displayName: DS.attr('string'),
	host: DS.attr('string'),
	dbname : DS.attr('string'),
	username: DS.attr('string'),
	password: DS.attr('string'),
	port: DS.attr('string'),
	socket: DS.attr('string'),
	useSsl: DS.attr('boolean'),
	queryDuration: DS.attr('number'),
	connectionType: DS.attr('string'),
	accountId: DS.attr('number'),
	serviceName: DS.attr('string'),
	dataServerName: DS.attr('string'),
	// connectionStatus: DS.attr('boolean'),

	connectionInfoClass: function(){
		return "connectionInfo-"+this.get('id');
	}.property(''),

});