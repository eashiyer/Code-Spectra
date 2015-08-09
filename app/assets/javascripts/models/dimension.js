

Cibi.Dimension = DS.Model.extend({
	fieldName: DS.attr('string'),
	formatAs: DS.attr('string'),
	displayName: DS.attr('string'),
	rank: DS.attr('number'),
	sortOrder: DS.attr('string'),
	isRow: DS.attr('boolean'),

	chart: DS.belongsTo('Cibi.Chart'),
	accountTemplate: DS.belongsTo('Cibi.AccountTemplate'),

});