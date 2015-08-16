Cibi.DataConnectionNewView = Ember.View.extend({
	templateName: 'data_connections/new',

	connectionTypes: function() {
		return ['mysql', 'mssql', 'oracle'];
	}.property(''),

	isOracle: function(){
		var obj=this;
		if(obj.get('connectionType') == "oracle"){
			return true;
		}
	}.property('connectionType'),

	isMssql: function(){
		var obj=this;
		if(obj.get('connectionType') == "mssql"){
			return true;
		}
	}.property('connectionType'),

	submit: function (e) {
		if(e.target.id != 'new-data-connection-form') {
			return;
		}
		e.preventDefault();
		var conn = {};
		conn.connectionType = this.get('connectionType');
		conn.displayName = this.get('displayName');
		conn.host = this.get('host');
		conn.dbname = this.get('dbname');
		conn.username = this.get('username');
		conn.password = this.get('password');
		conn.port = this.get('port');
		conn.socket = this.get('socket');
		conn.queryDuration = this.get('queryDuration');
		conn.accountId=Cibi.Auth.get('currentUser').get('account').get('id');
		conn.serviceName=this.get('serviceName');
		conn.dataServerName=this.get('dataServerName');

		var newDC = Cibi.DataConnection.createRecord(conn);
		newDC.transaction.commit();
		this.set('displayName', "");
		this.set('host', "");
		this.set('dbname', "");
		this.set('username', "");
		this.set('password', "");
		this.set('port', "");
		this.set('socket', "");
		this.set('queryDuration', "");
		this.set('serviceName', "");
		this.set('dataServerName', "");
	}
});