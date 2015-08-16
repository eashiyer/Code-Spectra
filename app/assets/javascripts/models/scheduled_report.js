Cibi.ScheduledReport = DS.Model.extend({
	userId: DS.attr('number'),
	dashboardId: DS.attr('number'),
  	isScheduled: DS.attr('boolean'),
  	lastSentAt: DS.attr('date'),
  	emails: DS.attr('string'),
  	days: DS.attr('number'),
  	time: DS.attr('number'),

	// dashboard: DS.belongsTo('Cibi.Dashboard'),
	// user: DS.belongsTo('Cibi.User'),

});