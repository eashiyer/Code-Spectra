Cibi.UserMgmtUserView = Em.View.extend({
	
	createUserFilterView: Em.View.extend({
		templateName: "user_mgmt/create_user_filter",
		dateFormats: function(){
			var formats=['','Month', 'Quarter', 'Year', 'Month Year', 'Day', 'Week'];
			if(this.get('field').data_type == "datetime"){
				formats.push('Hours');
				formats.push('Date');
			}
			return formats;
		}.property('field.data_type'),

		userFilterPopoverId: function() {
			return "user-filter-popover-" + this.get('user').get('id') + "-" + this.get('dataSource').get('id');
		}.property(''),

		open_popover: function() {
			var elem = $("#" + this.get('elementId')),
			popover_elem = elem.find(".popover");
			left_pos = elem.position().left - 135, //pageX - 180;
			top_pos = elem.position().top + 30;//el.pageY + 20;
			this.togglePopover(popover_elem, left_pos, top_pos);
		},

	 	togglePopover: function(popover_elem, x, y) {
	 		if(!popover_elem) {
				var elem = $("#" + this.get('elementId')),
				popover_elem = elem.find(".popover");	 			
	 		}
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


		fields: function() {
			return [''].concat(this.get('dataSource').get('fieldsHash'));
		}.property('dataSource'),

		display_name: function(){
			var name = this.get('field') ? this.get('field')['display_name'] : '';
			return name;
		}.property('field'),

		operators:  [
			{display: "in", value: 0},
			{display: "less than", value: 1},
			{display: "greater than", value: 2},
			{display: "not in", value: 3},
			{display: "not null", value: 4},
		],

		isDateField: function() {
			var field = this.get('field');
			if(!field) {
				return false;
			}
			if(field.data_type == "date" || field.data_type == "datetime") {
				return true;
			} 
		}.property('field'),

		filterValuesId: function() {
			return "create-user-filter-" + this.get('user').get('id') + "-" + this.get('dataSource').get('id');
		}.property('controller.id'),

		in_comparison: function() {
			var comparison_operator = this.get('comparison_operator');
			return comparison_operator == 0 || comparison_operator == 3;
		}.property('comparison_operator', 'isLoaded'),

		not_null: function() {
			var comparison_operator = this.get('comparison_operator');
			return comparison_operator == 4
		}.property('comparison_operator', 'isLoaded'),

		build_filter_values: function(){
			var obj = this;		
			var field = this.get('field'),
			controller = obj.get('controller'),
			elem = $("#" + obj.get('filterValuesId'));
			if(!field) {
				return;
			}
			var field_name = field.name;

			if(obj.get('not_null')){
				elem.html("");
				return;
			}			

			if(field_name) {
				if(obj.get('in_comparison')) {
					controller.getDimensionUniqueVals(field_name, obj.rebuild_select_box, obj);		
					obj.set('loading', true);
				} else {
					elem.html("<input class='select_box_multiselect input-small' type='number' />");
				}
			}
		}.observes('field', 'comparison_operator', 'format_as'),

		rebuild_select_box: function(values, obj) {			
			var elem = $("#" + obj.get('filterValuesId'));
			var field_name = obj.get('field_name');

			elem.html("<select class='select_box_multiselect' multiple='multiple' style='display:none'></select>");

			values = values.sort();

			if(obj.get('isDateField') 
				&& (obj.get('format_as') == 'Month' 
					|| obj.get('format_as') == 'Year' 
					|| obj.get('format_as') == 'Quarter' 
					|| obj.get('format_as')=='Month Year'
					|| obj.get('format_as')=='Hours'
					|| obj.get('format_as')=='Day'
					|| obj.get('format_as')=='Week')){
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
			obj.set('loading', false);
		},

		submit: function(e) {
			e.preventDefault();
			var obj = this,
			elem = $("#" + this.get('elementId')),
			display_name = this.get('display_name').trim() == "" ? this.get('field').name : this.get('display_name'),
			hide = this.get('hide'),
			field = this.get('field'),
			operator = this.get('comparison_operator'),
			format_as = this.get('format_as'),
			field_values = elem.find(".select_box_multiselect").val(),
			user = this.get('user'),
			data_source = this.get('dataSource'),			
			field_name = field.name,
			field_values_str = JSON.stringify(field_values)
			controller = this.get('controller');

			var user_filter_params = {
				"fieldName": field_name, "displayName": display_name, "formatAs": format_as, 
				"comparisonOperator": operator, "fieldValues": field_values_str,
				"hide": hide
			};

			var user_filter = Cibi.UserFilter.createRecord(user_filter_params),
			transaction = user_filter.get('transaction');
			user_filter.set("user", user);
			user_filter.set("dataSource", data_source);
			user_filter.on('didCreate', function(uf) {				
				obj.togglePopover();
				controller.set('success_message', "Filter Created!");
				setTimeout(function() {
					controller.set('success_message', false);
				}, 5000);
			});

			user_filter.on('becameError', function(errors) {
		  		// # record was invalid
		  		transaction.rollback();
		  		console.log(errors);
			    obj.set('error_message', "Unable to create the filter!");
				setTimeout(function() {
					controller.set('error_message', false);
				}, 5000);
	  		});


			transaction.commit();
		},

		cancel: function() {
			this.togglePopover();
		}

	}),

	userFiltersListView: Em.View.extend({
		templateName: "user_mgmt/user_filters_list",
		userFilters: function() {
			var data_source = this.get('dataSource'),
			userFilters = this.get('controller').get('userFilters');
			if(userFilters.get('isLoaded')) {
				return userFilters.filter(function(d) {		
					if(d.get('isLoaded') && d.get('dataSource')) {
						return d.get('dataSource').id == data_source.get('id');	
					}
				});
			}
			return [];
		}.property('controller.userFilters.@each.isLoaded'),

		userFilterView: Em.View.extend({
			templateName: "user_mgmt/user_filter",
			classNames: ['span', 'chart_filter'],
			classNameBindings: ['content.disabled:chart_filter_disabled:chart_filter_enabled'],
			tagName: 'div',

			didInsertElement: function() {
	        	var obj = this;
				obj.build_filter_values();				
	    	},

	    	userFilterValuesId: function() {
				return "user-filter-value-" + this.get('content').id;
			}.property(''),

	    	build_filter_values: function(){
				var obj = this;		
				var field_name = obj.get('content').get('fieldName'),
				format_as=obj.get('content').get('formatAs'),
				controller = obj.get('controller'),
				elem = $("#" + obj.get('userFilterValuesId'));
				if(obj.get('in_comparison')) {
					controller.getDimensionUniqueVals(field_name, obj.rebuild_select_box, obj, format_as);	
				} else if(obj.get('range_comparison') || obj.get('not_null')){
			    	elem.html("");
			    } else{
			    	var input_val = obj.get('content').get('fieldValues');
					elem.html("<input class='select_box_multiselect input-small' type='number' value=" + input_val + " />");
				}
				
			}.observes('content.fieldName', 'content.format_as', 'content.isLoaded'),

			rebuild_select_box: function(unique_vals, obj) {
				var elem = $("#" + obj.get('userFilterValuesId'));
				var field_name = obj.get('content').get('fieldName');
				elem.html("<select class='select_box_multiselect' multiple='multiple' style='display:none'></select>");

				var values = unique_vals.sort();

				if(obj.get('datatype_date') 
					&& (obj.get('content').get('formatAs') == 'Month' 
						|| obj.get('content').get('formatAs') == 'Year' 
						|| obj.get('content').get('formatAs') == 'Quarter'
						|| obj.get('content').get('formatAs') == 'Month Year')					
					   ){
					values = formatDates(obj.get('content').get('formatAs'), values);
				}

				var select_box = elem.find(".select_box_multiselect");
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
					classes: 'multiselect_btn multiselect_menu',
					checkAllText: 'All',
					uncheckAllText: 'None'
				}).multiselectfilter();
			},

			datatype_date: function() {			
				var obj = this;
				var datasource = obj.get('dataSource');
				var dimension = obj.get('content').get('fieldName');		
				var dataType = datasource.getDataType(dimension);				
				if(dataType=="date" || dataType == "datetime"){
					return true;
				}else{
					return false;
				}	
	    	}.property('content.fieldName'),

			in_comparison: function() {
				var comparison_operator = this.get('content').get('comparisonOperator');
				return comparison_operator == 0 || comparison_operator == 3;
			}.property('content.comparisonOperator', 'isLoaded'),

			range_comparison: function() {
				var comparison_operator = this.get('content').get('comparisonOperator');
				if(comparison_operator == 5){
					this.set('specific_date', true)
					return true;
				}				
			}.property('content.comparisonOperator', 'isLoaded', 'content.fieldName'),

			click: function(e) {
				var elemId = this.get('elementId');
				if(!elemId) {
					return;
				}
				e.stopPropagation();
				var clicked_elem = $(e.target),
				view_elem = $("#" + elemId);
				if(clicked_elem.hasClass("dropdown-toggle")) {
					var dropdown_menu = view_elem.find(".dropdown-menu")	;
					dropdown_menu.toggle();
				}
			},

			deleteFilter: function() {
				var r = confirm("Are you sure you want to delete this filter?");
				if(r == true){
					var obj = this.get('content'),
					controller = this.get('controller');

					obj.deleteRecord();
					obj.on('didDelete', function(d) {
						controller.set('success_message', "Filter Deleted!");	
						setTimeout(function() {
							controller.set('success_message', false);
						}, 5000);
					});
					obj.get('transaction').commit();
					this.closeFilter();
				}
			
			},

			disableFilter: function() {
				var obj = this.get('content'),
				controller = this.get('controller');

				if(obj.get('disabled')){
					obj.set('disabled',false);
				}else{
					obj.set('disabled',true);
				}			
				obj.on('didUpdate', function() {
					if(obj.get('disabled')) {
						controller.set('success_message', "Filter Disabled!");	
					} else {
						controller.set('success_message', "Filter Enabled!");	
					}
					
					setTimeout(function() {
						controller.set('success_message', false);
					}, 5000);
				});
				obj.get('transaction').commit();

				this.closeFilter();
			},

			filterState: function(){
				if(this.get('content').get('disabled')){
					return 'Enable'
				}else{
					return'Disable'
				}
			}.property('content.disabled'),

			updateFilter: function() {
				var obj = this.get('content');
				var parent = this, controller = this.get('controller');
				var selectedValues=$("#"+parent.get('userFilterValuesId')).find(".select_box_multiselect").val();
				obj.set('fieldValues', JSON.stringify(selectedValues));
				obj.on('didUpdate', function() {
					controller.set('success_message', "Filter Updated!");	
					setTimeout(function() {
						controller.set('success_message', false);
					}, 5000);
				})
				obj.get('transaction').commit();	
				this.closeFilter();	
			},

			closeFilter: function() {				
				var elemId = this.get('elementId');
				if(!elemId) {
					return;
				}
				var view_elem = $("#" + elemId),
				dropdown_menu = view_elem.find(".dropdown-menu")	;
				dropdown_menu.toggle();				
			}

		}),
	}),
});