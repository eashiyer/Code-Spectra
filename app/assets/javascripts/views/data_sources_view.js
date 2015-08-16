Cibi.DataSourcesView = Em.View.extend({	
	search_text: "",

	didInsertElement: function() {
		var window_height=$(window).height();
		// $("#data_sources_nav").css("min-height", (window_height - 235) + "px");
		// $("#data_sources_nav").css("height", (window_height - 235) + "px");
		this.init_pagination();
	},

	init_pagination: function(){
	  	$("div.holder").jPages({
		    containerID : "data_sources_nav",
		    perPage : 10,
		    first : 'First',
		    last : 'Last',
		    midRange : 1,
		    startRange : 0,
		    endRange : 0,
	  	});
	},

	data_sources: function(search){
		var controller = this.get('controller')
		return controller;
	}.property(''),

	search_observer: function(){
		var obj = this;
		var search_text = obj.get('search_text');
		var controller = obj.get('controller');
		if(search_text) {
			search_text = search_text.toLowerCase();
		}
		items =  controller.filter(function(item) {
            return item.get('name').toLowerCase().indexOf(search_text) >= 0
        });
        obj.set('data_sources', items);
        setTimeout(function() {
 			obj.init_pagination();
 		}, 200);        
	}.observes('search_text'),

	paginate: function(){
		var obj = this;
 		obj.init_pagination();		
	}.observes('controller'),

  getWorkspaceColor: function(){
  	var current_user = Cibi.Auth.get('currentUser');
  	if(current_user){
  			return current_user.get('get_workspace_color');
  	}
  }.property('Cibi.Auth.currentUser.isLoaded'),

	accountLeftNavColor: function(){
		var currentUser = Cibi.Auth.get('currentUser');
		var cVerticalColor = this.get('getWorkspaceColor');
		if(cVerticalColor != undefined){
			if(currentUser.get('workspaceColor') != undefined){
				cVerticalColor = currentUser.get('workspaceColor');
			}
			cVerticalColor ="background-color:"+d3.rgb(cVerticalColor).darker()+";min-height:44px; line-height:37px;";
		}
		return cVerticalColor;
	}.property('Cibi.Auth.currentUser.isLoaded'),

	accountLeftNavPillsColor: function(){
		var currentUser = Cibi.Auth.get('currentUser');
		var cVerticalColor = this.get('getWorkspaceColor');
		var height = ($(window).height() - 190);
		if(cVerticalColor != undefined){
			if(currentUser.get('workspaceColor') != undefined){
				cVerticalColor = currentUser.get('workspaceColor');
			}
			cVerticalColor ="background-color:"+cVerticalColor+";min-height:"+height+"px;height:"+height+"px;width:100%;overflow-y:auto;overflow-x:hidden;";
		}
		return cVerticalColor;
	}.property('Cibi.Auth.currentUser.isLoaded'),

});
