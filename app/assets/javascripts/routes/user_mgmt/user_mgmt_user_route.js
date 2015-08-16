Cibi.UserMgmtUserRoute = Cibi.AuthorizedRoute.extend({
	model: function (params) {
		return Cibi.User.find(params.user_id)
	},

	renderTemplate: function() {
		this.render("user_mgmt/user");
	},


})