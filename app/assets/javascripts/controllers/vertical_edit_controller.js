/** 
*@class Cibi.VerticalsNewController
*/

/**
  `Cibi.VerticalsNewController`. 

  This controller handles events on _verticals/new_ route.. 
  that is _verticals/new.handlebars_ template.

  "A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true."
  
  Ember creates controller for each model and also for model's possible routes implicitly, that is in memory, while the code is being executed. This is called active code generation. Sometimes we need to override default behavior, or handle specific actions, like `createVertical` in this case.

  @class Cibi.VerticalsNewController
  @extends Ember.ArrayController
*/
Cibi.VerticalEditController = Ember.ArrayController.extend({
	needs: ['vertical'],

});