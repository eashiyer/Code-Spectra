Cibi.VerticalsView = Em.View.extend({	

	didInsertElement: function() {
		$("#verticals_content").attr("min-height", $(window).height() - 128);
		$("#verticals_nav").css("min-height", $(window).height() - 128);
		$("#verticals_nav").css("height", $(window).height()  - 128);
		this.applyHoverEffects();
	},

	applyHoverEffects: function(){
		$(".vertical-tooltip").mouseover(function(){
			$(this).tooltip({
				html : true,
				container: 'body'
			});
			if($(this).children().first().attr('class').indexOf("active") !== -1){
				$(this).find('.options').css('position','relative');
				$(this).find('.options').show();				
			}		
		});
	}.observes('Cibi.Auth.globalSetting.isLoaded'),

	create_new: function() {
		var obj=this;
		var verticalName=$("#newVerticalName").val();
		if(verticalName == ""){
			// $("#newVerticalName").toggle("slow");
			$("#newVerticalName").css({border: "1px red solid"})
			setTimeout(function() {
				$("#newVerticalName").css({border: "0px"})
			}, 5000);
		}else{
			var vertical = {};
			vertical.name = verticalName;
			vertical.accountId = Cibi.Auth.get('currentUser').get('accountId');
			// this.set('verticalName', "");
			// e.preventDefault();
			this.get('controller').send('createVertical', vertical);
		}
	},

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
  			cVerticalColor ="background-color:"+d3.rgb(cVerticalColor).darker()+";height:44px; min-width:100%;padding-left:7px;";
  		}
  		return cVerticalColor;
  	}.property('Cibi.Auth.currentUser.isLoaded'),

  	accountLeftNavPillsColor: function(){
  		var currentUser = Cibi.Auth.get('currentUser');
  		var cVerticalColor = this.get('getWorkspaceColor');
  		var height = ($(window).height() - 128);
  		if(cVerticalColor != undefined){
  			if(currentUser.get('workspaceColor') != undefined){
  				cVerticalColor = currentUser.get('workspaceColor');
  			}
  			cVerticalColor ="background-color:"+cVerticalColor+";min-height:"+height+"px;height:"+height+"px;overflow-y: scroll; max-width:100%;min-width:100%;margin-top:25px;";
  		}
  		return cVerticalColor;
  	}.property('Cibi.Auth.currentUser.isLoaded'),

	deleteVertical: function(vertical) {
		var r = confirm("Are you sure you want to delete this vertical?");
		if (r === true) {
			vertical.deleteRecord();
			var store = vertical.get('store');

			store.commit();
		}
	},

	editVerticalsView: Em.View.extend({
		tagName: 'li',
		classNameBindings: ['hidden'],
		classNames:['list-item-height'],
		hidden:true,
		template: Em.Handlebars.compile("<form class='navbar-search form-inline' style='width:100%;'><input type='text' style='width:65%;'><button class='btn btn-small btn-success' style=\"margin-top: 0px;\" {{ action 'updateVertical' this target=view}}> <i class='icon-ok icon-white'></i> </button></form>"),
		updateVertical: function(vertical) {
			var newName = this.$().children().first().children().val();
			if (typeof newName === 'string' && newName !== "") {
				var id = this.templateData.keywords.vertical.id
				this.get('controller').send('updateVertical', id, newName);
			}
			//
			// this.$().prev().show();
			// this.$().children().hide();
			this.$().prev().removeClass('hidden');
			// this.$().prev().addClass('list-item-height');
			this.$().addClass('hidden');
		}

	})

});

Cibi.MouseOverView = Em.View.extend({

	mouseEnter: function(e) {
		// if( e.target.nodeName.toLowerCase() == 'div' 
		// 	&& e.target.parentElement.className.indexOf("active") !== -1) {
		// 	var options = e.target.parentElement.parentElement.children[1];
		// 	$(options).show();
		// 	// $($(options).children().eq(1).children()[0]).attr('class', 'icon-edit icon-white');
		// 	// $($(options).children()[2]).attr('class', 'icon-trash icon-white');
		// }
		// $(e.target.parentElement.parentElement).tooltip({
		// 	html : true,
		// 	container: 'body'
		// });
	},

	// mouseLeave: function(e) {
	// 	var options = e.target.parentElement.parentElement.children[1];
	// 	$($(options).find('.icon-trash')).attr('class', 'hidden');
	// 	$($(options).find('.icon-edit')).attr('class', 'hidden');

	// },

	// editVertical: function(vertical, e) {		
	// 	//this.get('controller').transitionToRoute('vertical.edit', vertical)
	// 	// var oldName = vertical.get('data')['attributes']['name'];
	// 	// var textElem = this.$().parent().parent();
	// 	// var inputElem = textElem.next();
	// 	// textElem.addClass('hidden');
	// 	// inputElem.removeClass('hidden');

	// 	// inputElem.children().children().val(oldName);


	// 	// var newName = prompt("Enter New name for this vertical : ", oldName);
	// 	// if (typeof newName === 'string' && newName !== "" && newName !== oldName) {
	// 	// 	var content = this.get('controller').get('content');
	// 	// 	this.get('controller').send('updateVertical', vertical, newName);
	// 	// };

	// },

});