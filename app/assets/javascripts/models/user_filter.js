Cibi.UserFilter = DS.Model.extend({
	fieldName: DS.attr('string'),
	displayName: DS.attr('string'),
	formatAs: DS.attr('string'),
	comparisonOperator: DS.attr('number'),
	fieldValues: DS.attr('string'),
	disabled: DS.attr('boolean'),
	hide: DS.attr('boolean'),

	user: DS.belongsTo('Cibi.User'),
	dataSource: DS.belongsTo('Cibi.DataSource'),

	operatorsMap:  [
		{display: "in", value: 0},
		{display: "less than", value: 1},
		{display: "greater than", value: 2},
		{display: "not in", value: 3},
		{display: "not null", value: 4},
	],

	operator: function() {
		var co = this.get('comparisonOperator');
		if(co == 4){
			return 'is'
		}
		if(co === undefined || co === null ) {
			return;
		}
		var operator = this.get('operatorsMap').filter(function(d) {
			return d.value == co;
		});
		return operator[0].display;
	}.property('comparisonOperator', 'isLoaded'),


	values: function() {
		var field_values = this.get('fieldValues');
		if(!field_values) {
			return [];
		}
		return JSON.parse(field_values);
	}.property('fieldValues'),

	values_str: function() {
		var vals = this.get('values')
		if(this.get('comparisonOperator') == 4){
			return 'NOT NULL'
		}
		vals = _.map(vals, function(v) {
			return displayTick(v);
		})
		return vals.join(',');
	}.property('values'),

});


