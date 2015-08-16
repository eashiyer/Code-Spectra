/**
@class Cibi.DataContent
*/

/**
  `Cibi.DataContent` is the `DataContent` model

  A DataContent has following attributes:

  `filename, content, createdAt, size, format, creationTime`

  A `DataContent` belongs_to `DataSource`

  @class Cibi.DataContent
*/
Cibi.DataContent = DS.Model.extend({
	init: function() {
		this._super();
	},

	filename  : DS.attr('string'),
	content   : DS.attr('string'),
	createdAt : DS.attr('date'),
	size      : DS.attr('number'),
	format    : DS.attr('string'),
	creationTime: DS.attr('string'),

	dataSource: DS.belongsTo('Cibi.DataSource'),

});