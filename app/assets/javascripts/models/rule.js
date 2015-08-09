Cibi.Rule = DS.Model.extend({
	ruleType: DS.attr('number'),
	ruleInput: DS.attr('string'),
	ruleOutput: DS.attr('string'),

    queryDataSource: DS.belongsTo('Cibi.DataSource'),
});