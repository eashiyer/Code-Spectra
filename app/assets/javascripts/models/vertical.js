/**
@class Cibi.Vertical
*/

/**
  `Cibi.Vertical` is the `Vertical` model

  A Vertical has following attributes:

  `name`

  A Cibi.Vertical has_many `Dashboards`


  @class Cibi.Vertical
*/
Cibi.Vertical = DS.Model.extend({
	name: DS.attr('string'),
	accountId: DS.attr('number'),
	description: DS.attr('string'),
	iconType: DS.attr('string'),
	customIcon: DS.attr('string'),
	customIconUrl: DS.attr('string'),

	dashboards: DS.hasMany('Cibi.Dashboard'),
	permissions: DS.hasMany('Cibi.Permission'),	
	accountTemplate: DS.belongsTo('Cibi.AccountTemplate'),
	    
	currentDashboards:function(){
		var currentPage=this.get('currentPage')?this.get('currentPage'):1;
		this.set('currentPage',currentPage);
		var dashboards=this.get('dashboards');
		var tempDashboards=[];
		var count=currentPage*4;
		for(var i=count-4;i<count && i<dashboards.get('length');i++)
		{
			tempDashboards.push(dashboards.objectAt(i));
		}
		return tempDashboards;
	}.property('Cibi.Auth.currentUser.isLoaded','currentPage', 'dashboards.length'),

	can_edit: function() {
		var isAdmin = Cibi.Auth.get('currentUser').get('isAdmin');
		if (isAdmin) {
			return isAdmin;
		}
		var role = Cibi.Auth.get('currentUser').get_role('Vertical', this.get('id'));
		var ret = ( role && role == "admin" ) || ( role && role == "manager" );
		return ret;
	}.property('Cibi.Auth.currentUser.isLoaded'),

	can_destroy: function() {
		var isAdmin = Cibi.Auth.get('currentUser').get('isAdmin');
		if (isAdmin) {
			return isAdmin;
		}
		var role = Cibi.Auth.get('currentUser').get_role('Vertical', this.get('id'));
		return role &&  role == 'admin';
	}.property('Cibi.Auth.currentUser.isLoaded'),

	getNextDashBoards:function(){
		var length = this.get('dashboards').length;
		if((this.get('currentPage')*3)<length)
		{
			this.get('currentPage')+1;
		}
	},

	iconUrl: function(){
		if(this.get('customIcon') && this.get('customIcon') != "/custom_icons/original/missing.png"){
			return this.get('customIconUrl')
		}else{
			var icon = this.get('iconType') !== null ? this.get('iconType') : "folder"
			return "assets/" + icon + ".png"
		}
	}.property('customIcon','customIconUrl'),

	titleDescription: function(e){
		var html = "<div style=\"height:auto; width: 200px; text-align:left;\">";
		html += "<h5 style='border-bottom:1px solid grey;'>"+this.get('name')+"</h5>";
		if(this.get('description')){
			html += "<p>"+this.get('description')+"</p>";
		}		
		html += "</div>";
		return html;
	}.property(''),

});