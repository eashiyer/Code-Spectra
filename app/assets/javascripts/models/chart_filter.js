Cibi.ChartFilter = DS.Model.extend({
	fieldName: DS.attr('string'),
	formatAs: DS.attr('string'),
	comparisonOperator: DS.attr('number'),
	fieldValues: DS.attr('string'),
	exclude: DS.attr('boolean'),
	disabled: DS.attr('boolean'),

	fieldDataType: DS.attr('string'),
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

	chart: DS.belongsTo('Cibi.Chart'),
	user: DS.belongsTo('Cibi.User'),
	
	operatorsMap:  [
		{display: "", value: null},
		{display: "in", value: 0},
		{display: "less than", value: 1},
		{display: "greater than", value: 2},
		{display: "not in", value: 3},
		{display: "not null", value: 4},
		{display: "max", value: 6},
		{display: "min", value: 7},
	],

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

	operator: function() {
		var co = this.get('comparisonOperator');
		if(co == 4 || co == 6 || co == 7){
			return 'is';
		}else if(co == 5){
			return 'range';
		}
		if(co === undefined || co === null ) {
			return;
		}
		var operator = this.get('operatorsMap').filter(function(d) {
			return d.value == co;
		});
		return operator[0].display;
	}.property('comparisonOperator', 'isLoaded'),

	comparison: function(){
		var co = this.get('comparisonOperator');
		switch(co) {
			case 4:
				return "NOT NULL";
				break;
			case 6:
				return "MAX";
				break;
			case 7:
				return "MIN";
				break;
		}
	}.property('comparisonOperator', 'isLoaded'),

	apply: function(data) {
		var obj = this;
		if(obj.get('isLoaded')) {
			var field_name = obj.get('fieldName');
			var values = obj.get('values');
			var comparisonOperator = obj.get('comparisonOperator');
			switch(comparisonOperator) {
				case 0:
					data = _.filter(data, function(d) {
						if(!values) {
							return true;
						}
						return values.indexOf(d[field_name]) != -1;
					});
					break;
				case 1:
					data = _.filter(data, function(d) {
						var val = toFloat(d[field_name]);
						return val < toFloat(values);
					});
					break;	
				case 2:
					data = _.filter(data, function(d) {
						var val = toFloat(d[field_name]);
						return val > toFloat(values);
					});
					break;	
				case 3:
					data = _.filter(data, function(d) {
						if(!values) {
							return true;
						}
						return values.indexOf(d[field_name]) == -1;
					});
					break;	
				case 4:
					data = _.filter(data, function(d) {						
						return d[field_name]
					});
					break;	
				default:			
					alert('operator default');
			}			
		}
		return data;
	},

});