Cibi.DashboardView = Ember.View.extend({
	templateName: 'dashboard',

	didInsertElement: function(){
		var obj = this;
		this.setTotalWidthHeight();
		$(this).tooltip({
	        selector: "[data-tooltip=tooltip]"
	    });

	    var filters=this.get('controller').get('content').get('chartsOnClickFilters');
	    if(filters.length > 0){
			$("#dashboard_charts_container").css("margin-top", "50px");
		}else{
			$("#dashboard_charts_container").css("margin-top", "0px");
		}

		$("#collapse").click(obj, function(el){	
			var obj = el.data;					
			if($('#collapse-icon').hasClass('icon-fast-backward')){
				// $('#show-vertical').animate({
				// 	width: '40%'
				// },50, function(){});
				$('#vertical_affix').css('width','4.3%')

				$('#collapse-li').css('text-align','right');
				$('#collapse-icon').removeClass('icon-fast-backward');
				$('#collapse-icon').addClass('icon-fast-forward');
				$('#verticals_content').css('margin-left','4.3%');
				$('#verticals_content').css('width','95.7%');
				$('#vertical-bar').css('min-width', '94.6%');
				$('.vertical-name').css('display','none');
				$('#new-workspace').html('<i class="icon-plus"></i>');
				$("div.chart-filter-bar").css("width", "93.5%");
			}else{
				// $('#show-vertical').animate({
				// 	width: '100%'
				// },50, function(){});
				$('#vertical_affix').css('width','11.3%')

				$('#collapse-li').css('text-align','right');
				$('#collapse-icon').removeClass('icon-fast-forward');
				$('#collapse-icon').addClass('icon-fast-backward');
				$('#verticals_content').css('margin-left','11.3%');
				$('#verticals_content').css('width','88.7%');
				$('#vertical-bar').css('min-width', '87.6%');
				$('.vertical-name').css('display','block');	
				$('#new-workspace').html('New workspace  <i class="icon-plus"></i>');
				$("div.chart-filter-bar").css("width", "86%");
			}
			obj.setTotalWidthHeight();	
			obj.set('widthChange',obj.get('controller').get('content').get('totalWidth'));
		});	  
	},

	reloadDashboard: function(){
		var controller = this.get('controller');
		var dashboard = controller.get('content');
		controller.transitionToRoute('dashboard.charts', dashboard);
	}.observes('widthChange'),

	applyTopMargin: function(){
		if(this.get('controller').get('content').stateManager.currentState.get('isLoaded')){
			var filters=this.get('controller').get('content').get('chartsOnClickFilters');
			if(filters.length > 0){
				$("#dashboard_charts_container").css("margin-top", "50px");
			}else{
				$("#dashboard_charts_container").css("margin-top", "0px");
			}
		}
	}.observes('controller.content.chartsOnClickFilters.length','isLoaded'),

	setTotalWidthHeight: function(){
		var dashboard=this.get('controller').get('content');
		var width=$("#main-tab").width();
		if(width != null){
			dashboard.set('totalWidth', width);
		}		
		var height=$(".tab-pane").height();
		dashboard.set('totalHeight', height);	
	}.observes('controller.content'),

	deleteDashboard: function(dashboard) {
		var r = confirm("Are you sure you want to delete this dashboard?");
		if (r === true) {
			dashboard.deleteRecord();
             var vertical_controller = this.get('parentView').get('controller');
             var vertical = vertical_controller.get('content');	
            dashboard.on('didDelete', function() {
              vertical.reload();
              vertical.set('dashboardDeleted', true);
		      setTimeout(function() {
			  vertical.set('dashboardDeleted', null);
		      }, 5000);   				 
			});
          
		   vertical_controller.transitionToRoute('vertical', vertical);
		   dashboard.get('transaction').commit();	

		}
	},

	colNums: function() {
		var dashboard_controller = this.get('controller'),
		columns = dashboard_controller.get('columns'),
		colNums = [];
		for(var i = 0; i < columns; i++ ) {
			colNums.push(i);
		}
		return colNums;
	}.property('controller.columns'),
	
	rowNums: function() {
		var dashboard_controller = this.get('controller'),
		rows = dashboard_controller.get('rows'),
		rowNums = [];
		for(var i = 0; i < rows; i++ ) {
			rowNums.push(i);
		}
		return rowNums;
	}.property('controller.rows'),

	chartGridDimensions: function() {
		var dashboard_controller = this.get('controller'),
		dashboard = dashboard_controller.get('content'),
		width = dashboard.getChartWidth(dashboard_controller.get('columns'), 1) + 10, 
		height = dashboard.getChartHeight(dashboard_controller.get('rows'), 1, true) + 140;		
		return "width: " + width + "px; height: " + height + "px;";
	}.property('controller.rows', 'controller.columns'),

	scheduleReportsView: Em.View.extend({
		templateName: 'dashboard/schedule_reports',

		scheduled_report_observer: function(){
			var scheduled_report = this.get('controller').get('content').get('scheduled_report')
			var email = Cibi.Auth.get('currentUser').get('email')
			if(scheduled_report !== undefined){
					var report = scheduled_report.objectAt(0)
					this.set('days',report.get('days'))
					//this.set('emails',report.get('emails'))
					this.set('is_scheduled',report.get('isScheduled'))				
					this.set('time',report.get('time'))
			}else{
				this.set('days', '')
				//this.set('emails',email)
				this.set('is_scheduled',false)				
				this.set('time','')	
			}
		}.observes('controller.content.scheduled_report'),

		time_arr: function(){
		  var arr = [];
		  for (var i = 0; i < 23; i++) {
		    arr.push(i);
		  }
		  return arr;
		}.property(''),

		scheduleReportsPopoverId: function() {
			return "schedule-reports-popover-" + this.get('controller').get('id');
		}.property('controller.id'),

		openPopover: function() {
			var obj = this,
			elem = $("#" + this.get('elementId')),
			left_pos = elem.position().left - 115, //pageX - 180;
			top_pos = elem.position().top + 30;//el.pageY + 20;
		 	obj.togglePopover(left_pos, top_pos);

		},

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

			var width = this.get('controller').get('width');	
			var popover_elem = elem.find(".popover");
			if(popover_elem.hasClass("hidden")) {
				popover_elem.removeClass("hidden");				
				if(x) {
					popover_elem.offset({left: x});	
				}			
				if(y) {
					popover_elem.offset({top: y});	
				}			

			} else {
				popover_elem.addClass("hidden");
			}
			var childElems = popover_elem.children();
			for(var i = 0; i < childElems.length; i ++) {
				var e = $(childElems[i]);
				e.toggleClass("hidden");
			}
		},	

		submit: function(e) {
			e.preventDefault();
			var elem = $("#" + this.get('elementId'));

			var data = {};
			data["userId"] = Cibi.Auth.get('currentUser').id;
			data["dashboardId"] = this.get('controller').get('id');
			data["isScheduled"] = this.get("is_scheduled");
			data["days"] = this.get('days');
			data["time"] = this.get("time");
			data["emails"] = Cibi.Auth.get('currentUser').get("email");

			this.get('controller').send('set_scheduled_report', data);		
            this.togglePopover();
		},	


		cancel:function(){
			$("#"+this.get('elementId')).find('.schedule_reports_popover').click();
			this.set('field_name', null);
			this.set('comparison_operator', null);
			$("#" + this.get('filterValuesId')).html(" ");
			return false;
		},		

	}),

	dashboardFiltersView: Em.View.extend({
		templateName: 'dashboard/dashboard_filters',
		reference_date_today: true,
		dashboardFiltersPopoverId: function() {
			return "dashboard-filter-popover-" + this.get('controller').get('id');
		}.property(''),
		
		operators:  [
			{display: "", value: null},
			{display: "in", value: 0},
			{display: "less than", value: 1},
			{display: "greater than", value: 2},
			{display: "not in", value: 3},
			{display: "not null", value: 4},
			{display: "max", value: 6},
			{display: "min", value: 7},
			//{display: "range", value: 5},    //this is added dynamically in the property operator_list. 
		],

		range_types: ['Today','Yesterday','Current Week','Last 7 Days','Previous Week','Previous Business Week',
					  'Last 30 Days','Current Month to Date','Last Month to Date','Current Calendar Quarter','Previous 3 Months',
					  'The Last 3 Months to Date','The Last 12 Months to Date','Last 365 Days','Current Year to Date',
					  'Previous Calendar Year'],

	    range_types_datetime: ['Last 5 Minutes','Last 10 Minutes','Last 30 Minutes','Last Hour','Last 3 Hours',
	    				   'Last 8 Hours','Last 12 Hours','Last 24 Hours','Last Three Days to Date/Time',
						   'This Week to Date/Time','Last Week to Date/Time (last 7 x 24 hours)','Last Two Weeks to Date/Time (last 14 x 24 hours)',
						   'Last Three Weeks to Date/Time (last 21 x 24 hours)','Past Month to Date/Time (this date last month till now)',
						   'This Year to Date/Time'],

		// period: ['Month', 'Quarter', 'Year', 'Month Year'],

		period_unit: ['Days', 'Weeks', 'Months', 'Quarters', 'Years', 'Date'],

		combined_range_types: function(){
			return this.get('range_types').concat(this.get('range_types_datetime'))
		}.property(''),

		isDate: function(){
			var field_type = this.get('fieldType');
			if(field_type && field_type.toLowerCase().trim() == 'date'){
				return true;
			}
			return false;
		}.property('fieldType'),

		isDateTime: function(){
			var field_type = this.get('fieldType');
			if(field_type && field_type.toLowerCase().trim() == 'datetime'){
				return true;
			}
			return false;
		}.property('fieldType'),

		isTime: function(){
			var field_type = this.get('fieldType');
			if(field_type && field_type.toLowerCase().trim() == 'time'){
				return true;
			}
			return false;
		}.property('fieldType'),

		isDateTime: function(){
			var field_type = this.get('fieldType');
			if(field_type && field_type.toLowerCase().trim() == 'datetime'){
				return true;
			}
			return false;			
		}.property('fieldType'),

		isDateTime: function(){
			var field_type = this.get('fieldType');
			if(field_type && field_type.toLowerCase().trim() == 'datetime'){
				return true;
			}
			return false;
		}.property('fieldType'),		

		period: function(){
			var formats=['Month', 'Quarter', 'Year', 'Month Year', 'Day', 'Week', 'Date'];

			var obj = this;
			var datasource = [];
			var field_name = this.get('field_name');		
			var fields_arr = this.get('controller').get('content').get('dashboardFieldsArr');
			var field = fields_arr.filter(function(d) { return d.text == field_name; })
			if(field.length > 0) {
				if(field[0]["value"] == "datetime"){
					formats.push('Hours');
					formats.push('Date');	
				}	
			}
			return formats;
		}.property('field_name'),

		display_name: function() {
			return this.get('field_name');
		}.property('field_name'),

		openPopover: function() {
			var obj = this,
			elem = $("#" + this.get('elementId')),
			left_pos = elem.position().left - 135, //pageX - 180;
			top_pos = elem.position().top + 30;//el.pageY + 20;
		 	obj.togglePopover(left_pos, top_pos);

		},

		is_specific_date: function(){
			if(this.get('specific_date')){
				this.set('reference_date_option', false);
		    	this.set('predefined_range', false);
		    }
		}.observes('specific_date'),

		is_reference_date_option: function(){
			if(this.get('reference_date_option')){
				this.set('specific_date', false);
	    		this.set('predefined_range', false);
	    	}
		}.observes('reference_date_option'),

		is_predefined_range: function(){
			if(this.get('predefined_range')){
				this.set('specific_date', false);
	    		this.set('reference_date_option', false);
	    	}
		}.observes('predefined_range'),

    	renderRangeView: function(){  
    		var elem = $(event.target);
    		_.each($('.range_selector'),function(radio){
	   			if(elem[0] == radio){
	   				$(radio).prop('checked',true);
	   			}else{
					$(radio).prop('checked',false);
	   			}
	    	});	
	    	if(elem.attr('value') == 0){
	    		this.set('specific_date', true);
	    		this.set('reference_date_option', false);
	    		this.set('predefined_range', false);
	    	}else if(elem.attr('value') == 1){
	    		this.set('specific_date', false);
	    		this.set('reference_date_option', true);
	    		this.set('predefined_range', false);
	    	}else if(elem.attr('value') == 2){
	    		this.set('specific_date', false);
	    		this.set('reference_date_option', false);
	    		this.set('predefined_range', true);
	    	}
    	},

    	disableReferenceDate: function(){
    		var elem = $(event.target);
    		if(elem.prop('checked')){
    			$('#reference_date').prop('disabled',true);
    			$('#reference_date').val($.datepicker.formatDate('mm/dd/yy', new Date()));
    		}else{
    			$('#reference_date').prop('disabled',false);
    		}
    		
    	}.observes('reference_date_today'),

    	datatype_date: function() {			
			var obj = this;
			var datasource = [];
			var field_name = this.get('field_name');		
			if(!field_name) {
				return false;
			}
			var fields_arr = this.get('controller').get('content').get('dashboardFieldsArr');
			if(!fields_arr) {
				return false;
			}

			var field = fields_arr.filter(function(d) { return d.text == field_name; })
			if(field.length > 0) {
				return (field[0]["value"] == "date" || field[0]["value"] == "datetime");	
			} else {
				return false;
			}
		}.property('field_name'),

		operator_list:  function(){
			var obj = this;
			if(obj.get('field_name')){
				if(obj.get('datatype_date')){
					var new_operators = this.operators.concat([{display: "range", value: 5}]);
					return new_operators;
				}else{
					return this.operators;
				}
			}else{
				return this.operators;
			}
	 	}.property('field_name'),

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

			var width = this.get('controller').get('width');	
			var popover_elem = elem.find(".popover");
			if(popover_elem.hasClass("hidden")) {
				popover_elem.removeClass("hidden");				
				if(x) {
					popover_elem.offset({left: x});	
				}			
				if(y) {
					popover_elem.offset({top: y});	
				}			

			} else {
				popover_elem.addClass("hidden");
			}
			var childElems = popover_elem.children();
			for(var i = 0; i < childElems.length; i ++) {
				var e = $(childElems[i]);
				e.toggleClass("hidden");
			}
		},

		submit: function(e) {
			e.preventDefault();
			var elem = $("#" + this.get('elementId'));
			var filter_elem = elem.find(".select_box_multiselect");
			var filters = filter_elem.val(),
			field_name = this.get('field_name'),
			format_as = this.get('format_as'),
			data_type = '',
			display_name = this.get('display_name'),
			comparison_operator = this.get("comparison_operator");
			is_global = this.get("is_global");

			var data = {};

			var date_range	= this.$('.range_selector:checked').prop("name");

			if(date_range == 0){
				var lower_range = elem.find("#dashboard_lower_range").find("input").val();
				var upper_range = elem.find("#dashboard_upper_range").find("input").val();
				if(lower_range && upper_range){
					data["dateRange"] = true
					if(this.get("fieldType").toLowerCase().trim() == 'time'){
						var time=lower_range;
						var timeArr=time.split(":");
						var dt=new Date();
						dt.setHours(timeArr[0]);
						dt.setMinutes(timeArr[1]);
						dt.setSeconds(timeArr[2]);
						data["lowerRange"] = dt;
						time=upper_range;
						timeArr=time.split(":");
						dt.setHours(timeArr[0]);
						dt.setMinutes(timeArr[1]);
						dt.setSeconds(timeArr[2]);
						data["upperRange"] = dt;
					}else{
						data["lowerRange"] = new Date(lower_range);
						data["upperRange"] = new Date(upper_range);
					}
				}
			}else if(date_range == 1){
				data["dateRange"] = false
				data["referenceDirection"] = $('input[name="reference_direction"]:checked').val();
				data["referenceCount"] = this.get('reference_count');
				data["referenceUnit"] = this.get('reference_unit');
				data["referenceDateToday"] = this.get('reference_date_today');
				if(this.get('reference_date_today')){
					data["referenceDate"] = $.datepicker.formatDate('mm/dd/yy', new Date());
				}else{
					var ref_date=elem.find("#reference_date").find("input").val();
					if(this.get("fieldType").toLowerCase().trim() == 'time'){
						var time=ref_date;
						var timeArr=time.split(":");
						var dt=new Date();
						dt.setHours(timeArr[0]);
						dt.setMinutes(timeArr[1]);
						dt.setSeconds(timeArr[2]);
						data["referenceDate"] = dt;
					}else{						
						data["referenceDate"] = new Date(ref_date);
					}
				}				
			}else if(date_range == 2){
				data["predefinedRange"] = this.get('selected_range');
			}

			var filter_hash = this.get('controller').get('content').get('filter_hash');
			filter_hash.forEach(function(h) {
				if(h.text == field_name){
					data_type = h.value;
				}
			});			
			if(format_as && comparison_operator != 5 && (data_type == "date" || data_type == "datetime")){
				data["formatAs"] = format_as;
			}
			data["fieldValues"] = JSON.stringify(filters);
			data["fieldName"] = field_name;
			data["displayName"] = display_name;
			data["fieldDataType"] = data_type;
			data["comparisonOperator"] = comparison_operator;
			data["isGlobal"] = is_global;

			this.get('controller').send('set_dashboard_filter', data);		
			this.set('comparison_operator', null);
			this.set('display_name', null)
            this.togglePopover();


		},

		build_filter_values: function(){
			var obj = this;		
			var field_name = this.get('field_name');
			controller = obj.get('controller'),
			elem = $("#" + obj.get('filterValuesId'));

			if(obj.get('not_null') || obj.get('max_min')){
				elem.html("");
				return
			}			
			if(field_name) {
				if(obj.get('in_comparison')) {
					obj.set('valuesLoading',true);
					controller.getDimensionUniqueVals(field_name, obj.rebuild_select_box, obj);		
				} else if(obj.get('range_comparison')){
		    		elem.html("");
		    	} else {
					elem.html("<input class='select_box_multiselect input-small' type='number' />");
				}
			}
		}.observes('field_name', 'comparison_operator', 'format_as'),

		// field_values: function() {
		// 	var obj = this;
		// 	var field_name = this.get('field_name');
		// 	if(!field_name) {
		// 		return [];
		// 	}
		// 	var elem = $("#" + obj.get('elementId'));
		// 	var values = [], controller;
		// 	controller = obj.get('controller');
		// 	values = controller.getDimensionUniqueVals(field_name);

		// 	return controller.get('unique_vals');
		// }.property('field_name', 'controller.unique_vals'),

		in_comparison: function() {
			var comparison_operator = this.get('comparison_operator');
			return comparison_operator == 0 || comparison_operator == 3;
		}.property('comparison_operator', 'isLoaded'),


		range_comparison: function() {
			var comparison_operator = this.get('comparison_operator');
			if(comparison_operator == 5){
				this.set('specific_date', true)
				return true;
			}				
		}.property('comparison_operator', 'isLoaded', 'field_name'),


		not_null: function() {
			var comparison_operator = this.get('comparison_operator');
			return comparison_operator == 4
		}.property('comparison_operator', 'isLoaded'),

		max_min: function(){
			var comparison_operator = this.get('comparison_operator');
			return comparison_operator == 6 || comparison_operator == 7;
 		}.property('comparison_operator', 'isLoaded'),

		filterValuesId: function() {
			return "dashboard-filter-" + this.get('controller').get('id');
		}.property('controller.id'),

		fieldType: function() {
			var field_name = this.get('field_name');		
			if(!field_name) {
				return false;
			}
			var fields_arr = this.get('controller').get('content').get('dashboardFieldsArr');
			if(!fields_arr) {
				return false;
			}
			var field = fields_arr.filter(function(d) { return d.text == field_name; })
			if(field.length > 0) {
				return field[0]["value"];	
			} else {
				return false;
			}
		}.property('field_name'),

		dateTypeField: function() {
			var field_type = this.get('fieldType');
			if(field_type && field_type.toLowerCase().trim() == 'date') {
				return true;
			}
			return false;
		}.property('fieldType'),

		rebuild_select_box: function(unique_vals, obj) {			
			var elem = $("#" + obj.get('filterValuesId'));
			var field_name = obj.get('field_name');

			if(obj.get('in_comparison')) {
				elem.html("<select class='select_box_multiselect' multiple='multiple' style='display:none'></select>");

				var values = unique_vals[field_name];

				if(obj.get('datatype_date') 
					&& (obj.get('format_as') == 'Month' 
						|| obj.get('format_as') == 'Year' 
						|| obj.get('format_as') == 'Quarter' 
						|| obj.get('format_as')=='Month Year'
						|| obj.get('format_as')=='Hours'
						|| obj.get('format_as')=='Day'
						|| obj.get('format_as')=='Week'
						|| obj.get('format_as')=='Date' )){
					values = formatDates(obj.get('format_as'), values);
				}

				var select_box = elem.find(".select_box_multiselect");
				select_box.html("");

		        for (var i = 0; i < values.length; i++) {
		            select_box.append('<option value="' + values[i] + '">' + values[i] + '</option>');
		        }
				select_box.multiselect({
					classes: 'multiselect_btn multiselect_menu',
					checkAllText: 'All',
					uncheckAllText: 'None'
				}).multiselectfilter();
				obj.set('valuesLoading',false);
			} 
		},

		cancel:function(){
			$("#"+this.get('elementId')).find('.dashboard_filter_popover').click();
			this.set('field_name', null);
			this.set('comparison_operator', null);
			$("#" + this.get('filterValuesId')).html(" ");
			return false;
		},

	}),

	dashboardFilterView: Em.View.extend({
		templateName: 'dashboard/dashboard_filter_view',
		classNames: ['span', 'dashboard_filter'],
		classNameBindings: ['content.disabled:dashboard_filter_disabled:dashboard_filter_enabled'],

		comparison: function() {
			var operator = this.get('content').get('comparisonOperator');
			switch(operator) {
				case 0: return 'in'
						  	break;
				case 1: return 'less than'
						  	break;
				case 2: return 'greater than'
						  	break;
				case 3: return 'not in'
						  	break;
				case 4: return 'is'
						  	break;	
				case 5: return 'between'
						  	break;
				case 6: return 'MAX'
							break;
				case 7: return 'MIN'
							break;						  					  
						  }						  
		}.property(''),


		didInsertElement: function() {
			var obj = this;
			if(obj.get('comparison') != 'between' && obj.get('comparison') != 'MAX' && obj.get('comparison') != 'MIN'){
				obj.build_filter();
				var selectedvals = JSON.parse(this.get('content').get('fieldValues'));
	    		$("#"+this.elementId).find("#" + this.get('dashboardFilterValuesId')).tooltip({'placement':'bottom',title:selectedvals,trigger:'hover' });
			}
			$('.tags').tooltip({placement: "bottom"});
	    	
	    },
		
		field_display: function() {
			return this.get('content').get('displayName') || this.get('content').get('fieldName');
		}.property('content.fieldName', 'content.displayName'),

		field_name: function() {
			return this.get('content').get('fieldName');
		}.property(''),

		format_as: function() {
			return this.get('content').get('formatAs');
		}.property(''),

		disabled: function() {
			return this.get('content').get('disabled');
		}.property(''),

		is_global: function() {
			return this.get('content').get('isGlobal');
		}.property(''),	

		check_global_and_admin: function() {
			is_global = this.get('content').get('isGlobal');
			if(is_global){
	 			flag = this.get('content').get('can_edit');
	 			return flag ? true : false
			}else{
				return true;
			}
		}.property(''),	

		deleteDashboardFilter: function() {
			var r = confirm("Are you sure you want to delete this filter?");
			if(r == true){
				var parent = this,
				dashboard = parent.get('controller').get('content');
				var obj = this.get('content');
				obj.deleteRecord();
				obj.on('didDelete', function() {
					dashboard.drawAll();		

				});
				obj.get('store').commit();				
			}
		},

		disableFilter: function() {
			var obj = this.get('content'),
			parent = this;
			if(obj.get('disabled')){
				obj.set('disabled',false);
			}else{
				obj.set('disabled',true);
			}			
			obj.on('didUpdate', function() {
				parent.get('controller').get('content').drawAll();				
			});
			obj.get('transaction').commit();			
		},

		filterState: function(){
			if(this.get('content').get('disabled')){
				return 'Enable'
			}else{
				return'Disable'
			}
		}.property('content.disabled'),

		updateDashboardFilter: function() {
			var obj = this.get('content');
			var parent = this, 
			elem = $("#" + this.get('dashboardFilterValuesId')),
			multiselect_elem = elem.find("#select_box_multiselect"),
			values = [];
			if(multiselect_elem && multiselect_elem.length > 0) {
				values = JSON.stringify(multiselect_elem.val());
			} else {
				values = JSON.stringify(this.$().find('.input-small').val());	
			}
			
			obj.set('fieldValues', values);		
			obj.on('didUpdate', function() {
				$("#" + parent.elementId).find("#" + parent.get('dashboardFilterValuesId')).tooltip('destroy');
				$("#" + parent.elementId).find("#" + parent.get('dashboardFilterValuesId')).tooltip({'placement':'bottom',title:JSON.parse(obj.get('fieldValues')),trigger:'hover' });
				parent.set('saveComplete', true);
				setTimeout(function() {
					parent.set('saveComplete', false);
				}, 3000);
				parent._parentView.get('controller').get('content').drawAll();
			});

			obj.get('store').commit();		
		},		

		build_filter: function(){
			var obj = this;		
			var field_name = this.get('field_name');
			controller = obj.get('controller');
			controller.getDimensionUniqueVals(field_name, obj.rebuild_filter_select_box, obj);
		},

		filter_value: function() {
			return parseFloat(JSON.parse(this.get('content').get('fieldValues')))
		}.property(''),

		show_dropdown: function() {
			var data_type = this.get('content').get('fieldDataType'),
			operator = this.get('content').get('comparisonOperator');
			return operator == 0 || operator == 3;
			// return data_type == 'varchar(200)' || data_type == 'date' || operator == 0 || operator == 3;
		}.property(''),

		show_text_box: function() {
			var data_type = this.get('content').get('fieldDataType'),
			operator = this.get('content').get('comparisonOperator');
			return  isNumericDataType(data_type) && operator != 0 && operator != 3;
		}.property(''),	

		getRange: function(){
			var content = this.get('content');
			if(content.get('dateRange') == false){
				var ref_date = (content.get('referenceDateToday') == 'true'|| content.get('referenceDateToday') == true) ? dateToday() : content.get('referenceDate');
				var direction = (content.get('referenceDirection') == 'previous') ? 'Last ' : 'Next ';
				str = '';
				str += direction;
				str += content.get('referenceCount') + ' ';
				str += content.get('referenceUnit');
				str += ' From ';
				str += $.datepicker.formatDate('dd M yy', new Date(ref_date)) 
				return str
			}else{
				var start_date = $.datepicker.formatDate('mm/dd/yy', content.get('lowerRange'));
				var end_date = $.datepicker.formatDate('mm/dd/yy', content.get('upperRange'));
				return start_date+ ' - ' + end_date;				
			}			
		}.property('content.upperRange', 'content.lowerRange', 'content.referenceCount','content.referenceUnit','content.referenceDateToday','content.referenceDirection','content.referenceDate','content.dateRange', 'content.predefinedRange'),

		range: function() {
			var filter_type = this.get('content').get('comparisonOperator');
			return filter_type == 5;
		}.property(''),			

		dashboardFilterValuesId: function() {
			return "dashboard-filter-value-" + this.get('content').id;
		}.property('this.content.id'),

		is_null: function() {
			return this.get('content').get('comparisonOperator') == 4
		}.property(''),

		max_min: function(){
			var comparison_operator = this.get('content').get('comparisonOperator');
			return comparison_operator == 6 || comparison_operator == 7;
 		}.property(''),

		rebuild_filter_select_box: function(unique_vals, obj) {
			//var obj = this;
			var elem = $("#" + obj.get('dashboardFilterValuesId'));
				if(obj.get('comparison') == 'is'){
					return
				}

			var field_name = obj.get('field_name'),
			data_type = obj.get('content').get('fieldDataType');

			if(obj.get('show_dropdown')) {
				elem.html("<select id='select_box_multiselect' multiple='multiple' style='display:none'></select>");

				var values = unique_vals[field_name];

				if(obj.get('content').get('formatAs')){
					values = formatDates(obj.get('content').get('formatAs'), values);
				}

				var select_box = elem.find("#select_box_multiselect");
				select_box.html("");
				var selected_vals = JSON.parse(obj.get('content').get('fieldValues'));
		        
		        for (var i = 0; i < values.length; i++) {
		        	var select_str = "";		        	
		        	if($.inArray( values[i], selected_vals ) != -1){
		        		select_str = "selected='selected'"
		        	}
		            select_box.append('<option value="' + values[i] + '"' + select_str + '>' + values[i] + '</option>');
		        }

			    select_box.multiselect({
			      onChange: function(element, checked) {
			      	 var selected = [];
				      $('#select_box_multiselect option:selected').each(function() {
				        selected.push($(obj).val());
				      });
			      }
			    });

				select_box.multiselect({
					classes: 'multiselect_btn multiselect_menu',
					checkAllText: 'All',
					uncheckAllText: 'None'
				}).multiselectfilter();
			}
		},

		dashboardFilterPopup: Em.View.extend({
			templateName: 'dashboard/dashboard_filter_popup',
			period_unit: ['Days', 'Weeks', 'Months', 'Quarters', 'Years'],

			range_types: ['Today','Yesterday','Current Week','Last 7 Days','Previous Week','Previous Business Week',
					  'Last 30 Days','Current Month to Date','Last Month to Date','Current Calendar Quarter','Previous 3 Months',
					  'The Last 3 Months to Date','The Last 12 Months to Date','Last 365 Days','Current Year to Date',
					  'Previous Calendar Year'],
	   		range_types_datetime: ['Last 5 Minutes','Last 10 Minutes','Last 30 Minutes','Last Hour','Last 3 Hours',
	    				   'Last 8 Hours','Last 12 Hours','Last 24 Hours','Last Three Days to Date/Time',
						   'This Week to Date/Time','Last Week to Date/Time (last 7 x 24 hours)','Last Two Weeks to Date/Time (last 14 x 24 hours)',
						   'Last Three Weeks to Date/Time (last 21 x 24 hours)','Past Month to Date/Time (this date last month till now)',
						   'This Year to Date/Time'],					  

	        didInsertElement: function() {
	        	var obj = this;
	        	var elem = $("#" + obj.get('rangeFilterPopoverId'));
	    		var btn = elem.find('.range_filter_popover')
	    		btn.click(function(el) {
	    			var left_pos = el.pageX -75;
	    			var top_pos = el.pageY + 20;
				 	obj.togglePopover(left_pos, top_pos);
	    		});
	    		if(obj.get('predefined_range')){
	    			obj.set('predefined_range', true);
	    		}else if(obj.get('specific_date') == true){
	    			obj.set('specific_date', true);
    			}else{
    				obj.set('reference_date_option', true);
    			}
    			if(this.get('parentView').get('content').get('referenceDirection') == 'previous'){
    				elem.find("input[name='reference_direction'][value='previous']").prop('checked', true);
    			}else{
    				elem.find("input[name='reference_direction'][value='next']").prop('checked', true);
    			}
	    	},

			combined_range_types: function(){
				return this.get('range_types').concat(this.get('range_types_datetime'))
			}.property(''),

	    	fieldType: function(){
	    		var field_name = this.get('parentView').get('field_name')		
				if(!field_name) {
					return false;
				}
				var fields_arr = this.get('controller').get('content').get('dashboardFieldsArr');
				if(!fields_arr) {
					return false;
				}
				var field = fields_arr.filter(function(d) { return d.text == field_name; })
				if(field.length > 0) {
					return field[0]["value"];	
				} else {
					return false;
				}
	    	}.property('parentView.field_name'),

	    	isDate: function(){
				var field_type = this.get('fieldType');
				if(field_type && field_type.toLowerCase().trim() == 'date'){
					return true;
				}
				return false;
			}.property('fieldType'),

			isTime: function(){
				var field_type = this.get('fieldType');
				if(field_type && field_type.toLowerCase().trim() == 'time'){
					return true;
				}
				return false;
			}.property('fieldType'),

			isDateTime: function(){
				var field_type = this.get('fieldType');
				if(field_type && field_type.toLowerCase().trim() == 'datetime'){
					return true;
				}
				return false;			
			}.property('fieldType'),

			rangeFilterPopoverId: function() {
	   	  		return 'range-filter-popover' + this.get('parentView').get('content').id;
	  	  	}.property(''),

			referenceDatePopoverId: function() {
	   	  		return 'reference-date-popover' + this.get('parentView').get('content').id;
	  	  	}.property(''),

			togglePopover: function(x, y) {
				var elem = $("#" + this.get('rangeFilterPopoverId'));

				var popover_elem = elem.find(".popover")
				if(popover_elem.hasClass("hidden")) {
					popover_elem.removeClass("hidden");				
					if(x) {
						popover_elem.offset({left: x});	
					}	
					if(y) {
						popover_elem.offset({top: y});	
					}			
				} else {
					popover_elem.addClass("hidden");
				}
				var childElems = popover_elem.children();
				for(var i = 0; i < childElems.length; i ++) {
					var e = $(childElems[i]);
					e.toggleClass("hidden");
				}	

			},
			
			range: function(){
				var content = this.get('parentView').get('content');
				if(content.get('predefinedRange')){
					return content.get('predefinedRange');
				}else{
					return this.get('parentView').get('getRange');
				}					
			}.property('parentView.getRange'),

			specific_date: function(){
				var content = this.get('parentView').get('content');
				return content.get('dateRange') && content.get('predefinedRange') == null ;
			}.property(''),

			reference_date_option: function(){
				var content = this.get('parentView').get('content');
				return !content.get('dateRange') && content.get('predefinedRange') == null;
			}.property(''),

			predefined_range: function(){
				var content = this.get('parentView').get('content');
				return content.get('predefinedRange') != null ;
			}.property(''),

			is_specific_date: function(){
				if(this.get('specific_date')){
					this.set('reference_date_option', false);
			    	this.set('predefined_range', false);
			    }
			}.observes('specific_date'),

			is_reference_date_option: function(){
				if(this.get('reference_date_option')){
					this.set('specific_date', false);
		    		this.set('predefined_range', false);
		    	}
			}.observes('reference_date_option'),

			is_predefined_range: function(){
				if(this.get('predefined_range')){
					this.set('specific_date', false);
		    		this.set('reference_date_option', false);
		    	}
			}.observes('predefined_range'),

	    	renderRangeView: function(){  
	    		var elem = $(event.target);
	    		_.each(this.$().find('.popup_range_selector'),function(radio){
		   			if(elem[0] == radio){
		   				$(radio).prop('checked',true);
		   			}else{
						$(radio).prop('checked',false);
		   			}
		    	});	
		    	if(elem.attr('value') == 0){
		    		this.set('specific_date', true);
		    		this.set('reference_date_option', false);
		    		this.set('predefined_range', false);
		    	}else if(elem.attr('value') == 1){
		    		this.set('specific_date', false);
		    		this.set('reference_date_option', true);
		    		this.set('predefined_range', false);
		    	}else if(elem.attr('value') == 2){
		    		this.set('specific_date', false);
		    		this.set('reference_date_option', false);
		    		this.set('predefined_range', true);
		    	}
	    	},	

	    	selected_range: function(){
	    		return this.get('parentView').get('content').get('predefinedRange');
	    	}.property(''),

	    	upper_range: function(){
	    		var date = this.get('parentView').get('content').get('upperRange');
	    		return date;
	    	}.property(''),

	    	lower_range: function(){
	    		var date = this.get('parentView').get('content').get('lowerRange');
	    		return date;
	    	}.property(''),	

	    	reference_count: function(){
				return this.get('parentView').get('content').get('referenceCount');
	    	}.property(''),	

	    	reference_unit: function(){
	    		return this.get('parentView').get('content').get('referenceUnit');
	    	}.property(''),	

	    	reference_date_today: function(){
	    		var flag = (this.get('parentView').get('content').get('referenceDateToday') == 'true') ? true : false 
	    		return flag;
	    	}.property(''),	

	    	reference_date: function(){
	    		var date = this.get('parentView').get('content').get('referenceDate');
	    		return date;
	    	}.property(''),

			submit: function(e) {
				e.preventDefault();
				var elem = $("#" + this.get('elementId'));
				var parent = this.get('parentView');
				var obj = this.get('parentView').get('content');
				var date_range = elem.find("input.popup_range_selector:checked").prop("name");
				obj.set('dateRange', (date_range == 0 ? true : false));					
				if(date_range == 0){
					var upper_range = elem.find(".dashboard_filter_upper_range").find("input").val();
					var lower_range = elem.find(".dashboard_filter_lower_range").find("input").val();
					if(this.get("fieldType").toLowerCase().trim() == 'time'){
						var time=lower_range;
						var timeArr=time.split(":");
						var dt=new Date();
						dt.setHours(timeArr[0]);
						dt.setMinutes(timeArr[1]);
						dt.setSeconds(timeArr[2]);							
						obj.set('lowerRange', dt);

						time=upper_range;
						timeArr=time.split(":");
						dt.setHours(timeArr[0]);
						dt.setMinutes(timeArr[1]);
						dt.setSeconds(timeArr[2]);
						obj.set('upperRange', dt);	
					}
					else{
						obj.set('upperRange', new Date(upper_range));	
						obj.set('lowerRange', new Date(lower_range));
					}	
					obj.set('referenceDate', null);		
					obj.set('referenceCount', null);
					obj.set('referenceUnit', null);
					obj.set('referenceDirection', null);
					obj.set('referenceDateToday', null);	
					obj.set("predefinedRange",null);
				}else if(date_range == 1){
					obj.set('upperRange', null);	
					obj.set('lowerRange', null);	
					obj.set('referenceCount', this.get('reference_count'));
					obj.set('referenceUnit', this.get('reference_unit'));
					if(this.get('reference_date_today')){
						obj.set('referenceDate', null);	
					}else{
						var ref_date=elem.find(".dashboard_filter_reference_date").find("input").val();
						if(this.get("fieldType").toLowerCase().trim() == 'time'){
							var time=ref_date;
							var timeArr=time.split(":");
							var dt=new Date();
							dt.setHours(timeArr[0]);
							dt.setMinutes(timeArr[1]);
							dt.setSeconds(timeArr[2]);
							obj.set('referenceDate', dt);
						}else{						
							obj.set('referenceDate', new Date(ref_date));
						}
					}
					var direction = elem.find("input[name='reference_direction']:checked").val()
					obj.set('referenceDirection', direction);
					obj.set('referenceDateToday', this.get('reference_date_today'));
					obj.set("predefinedRange",null);
				}else if(date_range == 2){
					obj.set("predefinedRange",this.get('selected_range'));
				}
				
				obj.on('didUpdate', function() {
					parent._parentView.get('controller').get('content').drawAll();
				})
				obj.get('store').commit();	
				this.togglePopover();	
			}
		}),

	}),

	dashboardLayoutView: Em.View.extend({
		templateName: 'dashboard/dashboard_layout',

		dashboardLayoutPopoverId: function() {
			return "dashboard-layout-popover-" + this.get('controller').get('id');
		}.property(''),

		openPopover: function() {
			var obj = this,
			elem = $("#" + this.get('elementId')),
			left_pos = elem.position().left - 80, //pageX - 180;
			top_pos = elem.position().top + 30;//el.pageY + 20;
		 	obj.togglePopover(left_pos, top_pos);
		},

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

			var width = this.get('controller').get('width');	
			var popover_elem = elem.find(".popover");
			if(popover_elem.hasClass("hidden")) {
				popover_elem.removeClass("hidden");				
				if(x) {
					popover_elem.offset({left: x});	
				}			
				if(y) {
					popover_elem.offset({top: y});	
				}			
				this._parentView._parentView.set('showGridLayout', true);
			} else {
				popover_elem.addClass("hidden");
				this._parentView._parentView.set('showGridLayout', false);
			}
			var childElems = popover_elem.children();
			for(var i = 0; i < childElems.length; i ++) {
				var e = $(childElems[i]);
				e.toggleClass("hidden");
			}
		},

		submit: function(e){
			e.preventDefault();
			var obj=this;
			var dashboard=obj.get('controller').get('content');
			var vertical=obj.get('parentView').get('parentView').get('controller').get('content');
			dashboard.set('vertical', vertical);
			dashboard.on("didUpdate", function(){
				obj.get('controller').transitionToRoute('dashboard.charts', dashboard);
			});
			dashboard.get('store').commit();
			this.togglePopover();
		},

		cancel:function(){
			var elem = $("#"+this.get('elementId'));
			if(elem) {
				elem.find('.dashboard_layout_popover').click();	
				this._parentView.set('showGridLayout', false);			
				return false;
			}
		}

	}),

});



// Cibi.DashboardNewView = Ember.View.extend({
// 	submit: function(e, params) {
// 		// e.preventDefault();
// 		// TODO: Change this shitty logic
// 		var dashboard = {};
// 		dashboard.displayName = e.target.elements[1].value;
// 		dashboard.title       = e.target.elements[2].value;
// 		dashboard.subtitle    = e.target.elements[3].value;
// 		// dashboard.dataSourceId = this.get('controller').get('content').owner.get('id');
// 		this.get('controller').send('createDashboard', dashboard);
// 		// reload current page or the newly created dashboard page
// 	}

// });

