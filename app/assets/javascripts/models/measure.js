

Cibi.Measure = DS.Model.extend({
	fieldName: DS.attr('string'),
	formatAs: DS.attr('string'),
	displayName: DS.attr('string'),
	sortOrder: DS.attr('string'),
	isCalculated: DS.attr('boolean'),
	prefix: DS.attr('string'),
	suffix: DS.attr('string'),
	unit: DS.attr('string'),

	chart: DS.belongsTo('Cibi.Chart'),
	accountTemplate: DS.belongsTo('Cibi.AccountTemplate'),

	factUnit:function(){
		unit = {};
		unit['prefix'] = this.get('prefix');
		unit['suffix'] = this.get('suffix');
		return unit;
	}.property('prefix', 'suffix'),
});