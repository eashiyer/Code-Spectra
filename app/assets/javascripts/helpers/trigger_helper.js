/**
  Sometimes, you may use the same HTML in your application multiple times. In those case, you can register a custom helper that can be invoked from any Handlebars template.

  This is a custom Handlebars helper which triggers a view on the target

        Ember.Handlebars.registerHelper('trigger', function (evtName, options) {

            var options = arguments[arguments.length - 1],
                hash = options.hash,
                view = options.data.view,
                target;

            view = view.get('concreteView');

            if (hash.target) {
                target = Ember.Handlebars.get(this, hash.target, options);
            } else {
                target = view;
            }

            Ember.run.next(function () {
                target.trigger(evtName);
            });
        });

  Anywhere in your Handlebars templates, you can now invoke this helper as:
    
        {{ trigger draw }}
  
  @method trigger
  @for Ember.Handlebars.helpers
  @param {String} evtName
  @param {Object} options
  @return null
*/
Ember.Handlebars.registerHelper('trigger', function (evtName, options) {

    var options = arguments[arguments.length - 1],
        hash = options.hash,
        view = options.data.view,
        target;

    view = view.get('concreteView');

    if (hash.target) {
        target = Ember.Handlebars.get(this, hash.target, options);
    } else {
        target = view;
    }

    Ember.run.next(function () {
        target.trigger(evtName);
    });
});



