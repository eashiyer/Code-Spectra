Cibi.VerticalsIndexView = Em.View.extend({
	didInsertElement: function() {
		var element = $(".homepage-bg");
		element.height($(window).height() - $("#top-nav-bar").height() - 5);

	}
});