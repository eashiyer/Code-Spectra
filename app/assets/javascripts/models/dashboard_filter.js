Cibi.DashboardFilter = DS.Model.extend({
	fieldName: DS.attr('string'),
	comparisonOperator: DS.attr('number'),
	fieldValues: DS.attr('string'),
	fieldDataType: DS.attr('string'),
	formatAs: DS.attr('string'),
	disabled: DS.attr('boolean'),
	dateRange: DS.attr('boolean'),
	upperRange: DS.attr('date'),
	lowerRange: DS.attr('date'),
	referenceDirection: DS.attr('string'),
  	referenceCount: DS.attr('number'),
  	referenceUnit: DS.attr('string'),
  	referenceDateToday: DS.attr('string'),
  	referenceDate: DS.attr('date'),
  	displayName: DS.attr('string'),
  	isGlobal: DS.attr('boolean'),
  	predefinedRange: DS.attr('string'),

	dashboard: DS.belongsTo('Cibi.Dashboard'),
	user: DS.belongsTo('Cibi.User'),

	dataType: function() {
		return this.get('fieldDataType');
	},

	can_edit: function() {
		var isAdmin = Cibi.Auth.get('currentUser').get('isAdmin');
		if (isAdmin) {
			return isAdmin;
		}
		var role = Cibi.Auth.get('currentUser').get_role('Dashboard', this.get('dashboard').id);
		return role && ( role == 'admin' )
	}.property('Cibi.Auth.currentUser.isLoaded'),
});