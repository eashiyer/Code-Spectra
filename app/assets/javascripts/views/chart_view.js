Cibi.ChartView = Ember.View.extend({

		tagName : "li",
		classNames: ['span'],

		didInsertElement: function(){
			var obj=this;
			obj.makeChartsResizable();
			obj.makeChartsSortable();
			obj.$().find('.title').tooltip();
			obj.$().find('.subtitle').tooltip();
		},

		date_type_dimension: function(){
			var	obj = this;
			var chart = this.get('controller').get('content');
			var dimensions = chart.get('dimensions');
			var dim = dimensions.objectAt(0);
			if(dim){
				var ds = chart.get('chartsDataSources').objectAt(0).get('dataSource');
				if(ds){
					var dataType = ds.getDataType(dim.get('fieldName'));
					if(dataType == 'date' || dataType == 'datetime'){
						obj.set('isDateType',true);
					}else{
						obj.set('isDateType',false);
					}
				}
			}
		}.observes('controller.content.isSetup'),

		chart_id:function(){
			var obj =this;
			var chart_id = this.get('controller').get('content').get('id');
			return "change_format" + chart_id;  
		}.observes('controller.content'),

		date_formats: function(){
			var	obj = this;
			var chart = this.get('controller').get('content');
			var dimensions = chart.get('dimensions');
			var ds = chart.get('chartsDataSources').objectAt(0).get('dataSource');
			var dim = dimensions.objectAt(0);
			var dataType = ds.getDataType(dim.get('fieldName'));
			if(dataType=="date" || dataType =="datetime"){
				// return ['','Month', 'Quarter', 'Year'];			
				var formats = [
					'Month Year','Day','Week'
				];

				if(dataType == "datetime"){
					formats.push('Hours'),
					formats.push('Date')
				}
				return formats;
			}else{
				return [];
			}			
		}.property('date_type_dimension'),

		makeChartsSortable: function(){
			var obj=this;
			var d=obj.get('controller').get('content').get('dashboard');
			$("#"+d.get('tabId')).find(".sortable").sortable({
				revert: true,
			    start: function(e, ui){
			    	ui.placeholder.width(ui.item.width() - 8);
			        ui.placeholder.height(ui.item.height());
			        
			        ui.placeholder.css("border", "2px dashed #444444");
			        ui.placeholder.css("visibility", "visible");
			    },
			    disabled: true				
			});

			$("#"+d.get('tabId')).find(".sortable").on("sortstop", function(event, ui){
				if(event.target.isSameNode($("#"+d.get('tabId')).find(".sortable")[0])){
					ui.placeholder.css("visibility", "hidden");
					// var rank = $(ui.item[0]).index();
					// console.log(c.get('id'));
					// if($(ui.item[0]).find("#"+c.get('containerId')).length > 0){
					// 	c.set('displayRank', rank);
					// 	c.get('store').commit();	
					// }
					var docHeight = $(window).height();
					$("#globalOverlay").height(docHeight);
					$("#globalOverlay").show();
					var hideLoader=true;
					var charts=d.get('charts');
					charts.forEach(function(c){
						var rank=$("#"+c.get('containerId')).parent().index();
						if(rank != -1 && c.get('displayRank') != rank) {
							hideLoader=false;
						   	c.set("displayRank",rank);
						   	c.get('store').commit();
						   	c.draw();
						}
					});
					if(hideLoader==true){
						$("#globalOverlay").hide();
					}
				}
			});
		},

		isSetup: function() {
			var flag = true;
			var obj=this;
			if(!(obj.get('controller').get('content').get('isDeleted'))){
				var d=obj.get('controller').get('content').get('dashboard') || null;
				if(d){
					var charts = d.get('charts');
				    charts.forEach(function(chart) {
				    	flag = flag && !(chart.get('isSaving'));
				    });	
				}				
			    if(flag){
			    	$("#globalOverlay").hide();
			    }
			}
		}.observes('controller.content.dashboard.charts.@each.isSaving'),

		makeChartsResizable: function(){
			var obj=this;
			var c=obj.get('controller').get('content');
			var d=c.get('dashboard');
			$(".resizable").resizable({
				grid: [d.getBlockWidth(),d.getBlockHeight()],
		    });
		    $("#"+c.get("containerId")).on("resizestop", function( event, ui ) {
		    	var numRows = Math.floor( ( ui.size.height + 1 )/d.getBlockHeight()),
		    	numCols = Math.floor( ( ui.size.width + 1 )/d.getBlockWidth());
		    	numRows  = numRows < 1 ? 1 : numRows;
		    	numCols  = numCols < 1 ? 1 : numCols;
		    	c.set("rows", numRows);
				c.set("columns", numCols);
				c.on('didUpdate', function() {
					// obj.get("controller").transitionToRoute('dashboard.charts', d);
					c.draw();
				});
				c.get('store').commit();
			});
		},
		// .observes('controller.content.dashboard.rows', 'controller.content.dashboard.columns'),
		
		draw: function() {
        	
			var controller = this.get('controller');
			var obj = this;

			controller.send('draw');

			var elem = $("#" + this.get('controller').get('containerId'));
			// if(elem) {
			// 	elem.sortable({
			// 		placeholder: "ui-state-highlight"
			// 	});
			// }

		},

		chartErrorDimension: function(){
			var obj = this;
			var content = obj.get('controller').get('content');
			return 'text-align: center;height:'+(content.get('height')+5)+'px;width:'+content.get('width')+'px;'
		}.property(''),

		chartObjectsContainerView: Ember.ContainerView.extend({
			viewName: 'chartObjects',
			childViews: [],
		}),		

	chartMarginsView: Em.View.extend({
		templateName: 'charts/chart_margins',
		displayUnits:['No Units', 'k, M, B', 'k, L, Cr'],
        didInsertElement: function() {
        	$('.margin_popover').tooltip();
        	$("input[name='orientation_type'][value='"+ this.get('controller').get('content').get('orientationType') +"'][id='"+ this.get('controller').get('content').get('orientationRadioId') +"']").attr('checked', 'checked');
        	$("#"+this.get('controller').get('content').get('containerId')).find("div[name='xDomainMinValue']").tooltip();
        	$("#"+this.get('controller').get('content').get('containerId')).find("div[name='xDomainMaxValue']").tooltip();
        	this.enableDisableDisplayUnits();
        },

        columnLimit: function(){
        	var chart = this.get('controller').get('content');
        	return chart.get('columnLimit');
        }.property('controller.content.columnLimit'),

        rowLimit: function(){
        	var chart = this.get('controller').get('content');
        	return chart.get('rowLimit');
        }.property('controller.content.rowLimit'),

        hasAxes: function(){
        	return this.get('controller').get('content').get('hasAxes');
        }.property(''),

        hasSingleYAxis: function(){
        	if(this.get('controller').get('content').get('chartType')==6)
        	{
        		return false;
        	}
        	else{
        		return true;
        	}
        }.property('controller.content.chartType'),

		click: function(el) {
			var elem = $("#" + this.get('elementId'));
			$('.popover').each(function () {
				if(!$(this).is(elem.find('.popover'))){
					$(this).addClass("hidden");
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i++) {
						var e = $(childElems[i]);
						e.addClass("hidden");
					}	
				}

		    });

			if(el.target.className.indexOf('icon-fullscreen') == -1) {
				return;
			}		
			var left_pos=elem.parent().parent().position().left;
			var top_pos=elem.parent().offset().top+25;
			this.togglePopover(left_pos, top_pos);
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
			var orientationType	   = this.$('input[name="orientation_type"]:checked').val();
			this.get('controller').get('content').set('orientationType',orientationType);
			this.get('controller').send('updateMargins');
			this.togglePopover();
		},

		enableDisableDisplayUnits: function(){
        	if(this.get('controller').get('content').get('chartType')=="10" || this.get('controller').get('content').get('chartType')=="horizontal-bar"){
        		$("#"+this.get('controller').get('content').get('containerId')).find("select[name='yAxisDisplayUnit']").attr("disabled",true);
        		$("#"+this.get('controller').get('content').get('containerId')).find("select[name='xAxisDisplayUnit']").attr("disabled",false);	
        	}
        	else{
	        	if(this.get('controller').get('content').get('scale_type')=="linear"){
	        		$("#"+this.get('controller').get('content').get('containerId')).find("select[name='xAxisDisplayUnit']").attr("disabled",false);	
	        	}
	        	else{
	        		$("#"+this.get('controller').get('content').get('containerId')).find("select[name='xAxisDisplayUnit']").attr("disabled",true);
	        	}
	        }
        	// console.log($("#"+this.get('controller').get('content').get('containerId')).find("select[name='yAxisDisplayUnit']"));
        }.observes('controller.content.chartType')
	}),

	chartDataSourceView: Em.View.extend({
		templateName: 'charts/chart_data_source',
		dimensionsSupportedFormats: ['', 'Date String', 'Quarter', 'Number Group'],
		didInsertElement: function() {
        	$('.data_source_popover').tooltip();
        },

		click: function(el) {
			var elem = $("#" + this.get('elementId'));
			$('.popover').each(function () {
				if(!$(this).is(elem.find('.popover'))){
					$(this).addClass("hidden");
					
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i ++) {
						var e = $(childElems[i]);
						e.addClass("hidden");
					}
				}		        		            
		    });
			if(el.target.className.indexOf('charts_data_source_icon') == -1) {
				return;
			}
			var left_pos=elem.parent().parent().position().left;
			var top_pos=elem.parent().offset().top+25;
			this.togglePopover(left_pos, top_pos);
		},

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

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
			this.get('controller').send('updateDataSource');
			this.togglePopover();
		},

		factTypes: function() {
			return ['', 'money', 'percentage'];
		}.property(''),

		factUnits: function() {
			return ['', 'USD', 'Rs','Euro','%'];
		}.property(''),
	
		factFormats: function() {
			return [
				{ name: '', key: ''},
				{ name: 'Sum of Fact', key: 'sum'},
				{ name: 'Mean of Fact', key: 'avg'},
				{ name: 'Standard Deviation of Fact', key: 'stddev'},
				{ name: 'Standard Error of Mean of Fact', key: 'sem'},			
				{ name: 'Number of Missing Entries in Fact Column', key: 'noops'},
				{ name: '% Missing Entries of Total Count', key: 'noopspc'}, 
				{ name: 'Number of Valid Entries (Count)', key: 'count'},
				{ name: '% Valid Entries of Total Count', key: 'opspc'},
				{ name: 'Count unique fact fields', key:'count,distinct'},
			];
		}.property(''),
	}),

	editChart: function(chart) {
			var title = chart.get('data')['attributes']['title'];
			var subtitle = chart.get('data')['attributes']['subtitle'];
			if (title) {
				this.$('form > #title').val(title);
			}
			if (subtitle) {
				this.$('form > #subtitle').val(subtitle);
			}
			var textElem = this.$('#titlediv');
			textElem.addClass('hidden');

			var inputElem = this.$('#titlediv').next();
			inputElem.removeClass('hidden');

		},
		editTitleView: Em.View.extend({
			classNames: ['span', 'hidden'],
			templateName: 'charts/edit',

			updateChart: function(chart) {
				var newTitle = this.$('form > #title').val();
				var newSubtitle = this.$('form > #subtitle').val();
				var updatedData = {};
				var id = this.templateData.keywords.chart.id

				if(typeof newTitle ==='string' && typeof newSubtitle ==='string')
				{
					updatedData.title = newTitle;
					updatedData.subtitle = newSubtitle;
				}
				else if (typeof newTitle === 'string') {
					updatedData.title = newTitle;
				}
				else{
					updatedData.subtitle = newSubtitle;
				}
				this.get('controller').send('updateChart', id, updatedData);				
				this.$().prev().removeClass('hidden');
				this.$().addClass('hidden');
				this.$().prev().find('.title').attr('data-original-title', newTitle);
				this.$().prev().find('.subtitle').attr('data-original-title', newSubtitle);
			},
		}),



	chartConfigsView: Em.View.extend({
		templateName: 'charts/chart_configs',
		didInsertElement: function() {
        	$('.data_source_popover').tooltip();
        	var elem = $("#" + this.get('elementId'));
        	var configObject=this.get('controller').get('configObject');
        	var count = this.get('controller').get('chartsDataSources').objectAt(0).get('count');
        	this.set('count',count);
        	// if(configObject["hide_row_total"]=="on"){
        	// 	elem.find("input:checkbox[name='hide_row_total']").prop("checked", true);
        	// }else{
        	// 	elem.find("input:checkbox[name='hide_row_total']").prop("checked", false);
        	// }
        	// if(configObject["hide_column_total"]=="on"){
        	// 	elem.find("input:checkbox[name='hide_column_total']").prop("checked", true);
        	// }else{
        	// 	elem.find("input:checkbox[name='hide_column_total']").prop("checked", false);
        	// }
        },

        displayUnits:['No Units (Indian)', 'No Units (American)', 'k, M, B', 'k, L, Cr', 'Only Lakhs', 'Only Crores', 'Only Millions', 'Only Billions'],

        colorPallette: function(){
			colors=["","Aqua","Blue","Brown","Gray","Green","Indigo","Orange","Pink","Purple","Red","Yellow"];
			return colors;
		}.property(''),

		click: function(el) {
			var elem = $("#" + this.get('elementId'));
			$('.popover').each(function () {
				if(!$(this).is(elem.find('.popover'))){
					$(this).addClass("hidden");				
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i ++) {
						var e = $(childElems[i]);
						e.addClass("hidden");
					}
				}		        		            
		    });

			if(el.target.className.indexOf('icon-cog') == -1) {
				return;
			}
			// var elem = $("#" + this.get('elementId'));
			var popover_elem = elem.find(".popover");

			var left_pos=elem.parent().parent().position().left;
			var top_pos=elem.parent().offset().top+25;
			//var left_pos = el.pageX - 187.5;		
			//var top_pos = el.pageY + 15;
			this.togglePopover(left_pos, top_pos);
		},

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

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

		bar: function() {
			return this.get('controller').get('chartType') == '1';
		}.property('controller.chartType'),

		ctree: function() {
			return this.get('controller').get('chartType') == '3';
		}.property('controller.chartType'),

		ctable: function() {
			return this.get('controller').get('chartType') == '0';
		}.property('controller.chartType'),

		geo: function() {
			return this.get('controller').get('chartType') == '4';
		}.property('controller.chartType'),

		heatmap: function() {
			return this.get('controller').get('chartType') == '5';
		}.property('controller.chartType'),

		line: function() {
			return this.get('controller').get('chartType') == '8';
		}.property('controller.chartType'),

		table: function() {
			return this.get('controller').get('chartType') == '7';
		}.property('controller.chartType'),
		
		multiline: function() {
			return this.get('controller').get('chartType') == '9';
		}.property('controller.chartType'),

		hbar: function() {
			return this.get('controller').get('chartType') == '10';
		}.property('controller.chartType'),

		grouped_table: function() {
			return this.get('controller').get('chartType') == '14';
		}.property('controller.chartType'),

		single_value: function() {
			return this.get('controller').get('chartType') == '15';
		}.property('controller.chartType'),


		submit: function(e) {
			e.preventDefault();
			var data = JSON.parse(this.get('controller').get('content').get('configs')) || {};
			for(i=0;i< e.target.elements.length-2;i++){
				var elem = e.target.elements[i];
				if(elem.type === 'checkbox'){
					if(elem.checked == true){
						data[elem.name] = true;
					}else{
						if(data[elem.name]){
							data[elem.name] = false;
						}
					}					
				} else if(elem.type === 'button' ) {
					if(elem.className === 'btn btn-primary active') {
						data[elem.name] = elem.value
					}
				} else if (elem.type == "text") {
					if(elem.className.indexOf("arrayField") != -1) {
						data[elem.name] = elem.value.split(',').map(function(s) {
							return s.trim();
						});
					} else {
						data[elem.name] = elem.value;
					}
			   } else {
		   			data[elem.name] = elem.value;		
			   }
			}
			this.get('controller').send('updateChartConfigs',data);
			this.togglePopover();
		},
	}),


	chartTypesView: Em.View.extend({
       templateName: 'charts/chart_types',
       didInsertElement: function() {
    	$('.type_popover').tooltip();
        	$("button").tooltip({
				placement: "bottom"
			});
        },


       click: function(el) {
       		var elem = $("#" + this.get('elementId'));
			$('.popover').each(function () {
				if(!$(this).is(elem.find('.popover'))){
					$(this).addClass("hidden");
				
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i ++) {
						var e = $(childElems[i]);
						e.addClass("hidden");
					}
				}		        		            
		    });
			if(el.target.className.indexOf('edit_chart_types') == -1) {
				return;
			}
			// var elem = $("#" + this.get('elementId'));
			//var popover_elem = elem.find(".popover");
			var left_pos=elem.parent().parent().position().left;
			var top_pos=elem.parent().offset().top+25;
			this.togglePopover(left_pos, top_pos);
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
			var elem = $(e.target);
			var type = {};
			type.chartType = elem.find(".active").val();
			this.get('controller').send('updateTypes',type);					
            this.togglePopover();
		},

		showBarGraph: function()  {
		    return this.get('controller').get('editType').indexOf('1') !== -1;
		}.property('controller.chartType'),

        showPieGraph: function()  {
			return this.get('controller').get('editType').indexOf('2') !== -1;
		}.property('controller.chartType'),

        showAreaGraph: function()  {
			return this.get('controller').get('editType').indexOf('11') !== -1;
		}.property('controller.chartType'),

		showLineGraph: function()  {
			return this.get('controller').get('editType').indexOf('8') !== -1;
		}.property('controller.chartType'),

		showComboChart: function()  {
			return this.get('controller').get('editType').indexOf('6') !== -1;
		}.property('controller.chartType'),
			  
        showMultiline: function()  {
			return this.get('controller').get('editType').indexOf('9') !== -1;
		}.property('controller.chartType'),

        showDonutGraph: function()  {
			return this.get('controller').get('editType').indexOf('17') !== -1;
		}.property('controller.chartType'),

        showFunnelGraph: function()  {
			return this.get('controller').get('editType').indexOf('18') !== -1;
		}.property('controller.chartType'),

		showSingleValue: function() {
			return this.get('controller').get('editType').indexOf('15') !== -1;
		}.property('controller.chartType'),

		showGaugeGraph: function() {
			return this.get('controller').get('editType').indexOf('20') !== -1;
		}.property('controller.chartType'),				
	}),

	chartFiltersListView: Em.View.extend({
		templateName: 'charts/controls/chart_filters_list',

		chartFilterView: Em.View.extend({
			templateName: 'charts/controls/chart_filter',			
			classNames: ['span', 'chart_filter', 'pull-right'],
			classNameBindings: ['content.disabled:chart_filter_disabled:chart_filter_enabled'],
			tagName: 'div',
			period_unit: ['Days', 'Weeks', 'Months', 'Quarters', 'Years', 'Date'],

			didInsertElement: function() {
	        	var obj = this;

				obj.build_filter_values();


				var elem = $("#" + obj.get('rangeFilterPopoverId'));
	    		if(obj.get('specific_date') == true){
	    			obj.set('specific_date', true);
	    			// elem.find("input[name='range_selector0']").prop('checked', true);
    			}else{
    				obj.set('reference_date_option', true);
    				// elem.find("input[name='range_selector1']").prop('checked', true);
    			}
    			if(this.get('content').get('referenceDirection') == 'previous'){
    				elem.find("input[name='reference_direction'][value='previous']").prop('checked', true);
    			}else{
    				elem.find("input[name='reference_direction'][value='next']").prop('checked', true);
    			}
    			
				var filter = obj.get('content');

    			if(filter.get('isLoaded') && filter.get('comparisonOperator') != 5){
    				var selectedvals = JSON.parse(filter.get('fieldValues'));
	    			$("#"+this.elementId).find(".dropdown-toggle").tooltip({'placement':'bottom',title:selectedvals,trigger:'hover' });
   	    		}
   	    	},

	    	fieldType: function(){
	    		var obj = this;
				var datasource = obj.get('controller').get('content').get('chartsDataSources').objectAt(0).get('dataSource');
				var dimension = obj.get('content').get('fieldName');		
				var dataType = datasource.getDataType(dimension);
				return dataType;
	    	}.property('content.fieldName'),

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

	    	range: function() {
				var filter_type = this.get('content').get('comparisonOperator');
				return filter_type == 5;
			}.property(''),

			not_null: function(){
				var filter_type = this.get('content').get('comparisonOperator');
				return filter_type == 4;
			}.property(''),

			max_min: function(){
				var filter_type = this.get('content').get('comparisonOperator');
				return filter_type == 6 || filter_type == 7;
			}.property(''),

	    	chartFilterValuesId: function() {
				return "chart-filter-value-" + this.get('content').id;
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
			}.property('content.upperRange', 'content.lowerRange', 'content.referenceCount','content.referenceUnit','content.referenceDateToday','content.referenceDirection','content.referenceDate','content.dateRange'),

	    	build_filter_values: function(){
				var obj = this;		
				var field_name = obj.get('content').get('fieldName');
				var format_as=obj.get('content').get('formatAs'),
				controller = obj.get('controller');
				controller.getDimensionUniqueVals(field_name, obj.rebuild_select_box, obj, format_as);
			}.observes('content.fieldName', 'content.format_as', 'controller.isSetup'),

			rebuild_select_box: function(unique_vals, obj) {
				var elem = $("#" + obj.get('chartFilterValuesId'));
				if(obj.get('not_null') || obj.get('max_min')){
					elem.html("");
					return
				}			
				var field_name = obj.get('content').get('fieldName');

				if(obj.get('in_comparison')) {
					elem.html("<select class='select_box_multiselect' multiple='multiple' style='display:none'></select>");

					var values = unique_vals;

					if(obj.get('datatype_date') 
						&& (obj.get('content').get('formatAs') == 'Month' 
							|| obj.get('content').get('formatAs') == 'Year' 
							|| obj.get('content').get('formatAs') == 'Quarter' 
							|| obj.get('content').get('formatAs')=='Month Year'
							|| obj.get('content').get('formatAs')=='Hours'
							|| obj.get('content').get('formatAs')=='Day'
							|| obj.get('content').get('formatAs')=='Week'
							|| obj.get('content').get('formatAs')=='Date')){
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
				} else if(obj.get('range_comparison')){
			    	elem.html("");
			    }else{
			    	var input_val = obj.get('content').get('fieldValues');
					elem.html("<input class='select_box_multiselect input-small' type='number' value=" + input_val + " />");
				}
			},

			datatype_date: function() {			
				var obj = this;
				var datasource = obj.get('controller').get('content').get('chartsDataSources').objectAt(0).get('dataSource');
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
					// this.set('specific_date', true)
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
					var dropdown_menu = view_elem.find(".dropdown-menu");
					var ds=$("#main-tab");
					var left=ds.position().left;
					var right=left+(ds.width());
					if((e.pageX+250) > right){
						dropdown_menu.css("left", "auto");
						dropdown_menu.css("right", "-4px");
					}					
					dropdown_menu.toggle();
				}
			},

			deleteChartFilter: function() {
				var r = confirm("Are you sure you want to delete this filter?");
				if(r == true){
				var obj = this.get('content'),
				chart = this.get('controller').get('content');

				obj.deleteRecord();
				obj.get('transaction').commit();
				obj.on('didUpdate', function() {
					chart.draw();
				});
				this.get('controller').get('content').draw();
				}
				this.closeChartFilter();
			},

			disableFilter: function() {
				var obj = this.get('content'),
				chart = this.get('controller').get('content');

				if(obj.get('disabled')){
					obj.set('disabled',false);
				}else{
					obj.set('disabled',true);
				}			
				obj.on('didUpdate', function() {
					chart.draw();
				});
				obj.get('transaction').commit();
				this.closeChartFilter();
			},

			filterState: function(){
				if(this.get('content').get('disabled')){
					return 'Enable'
				}else{
					return'Disable'
				}
			}.property('content.disabled'),

			updateChartFilter: function() {
				if(this.get('range')){
					var elem = $("#" + this.get('elementId'));
					var obj = this.get('content');
					var parent = this;
					var date_range = (elem.find("input[class='popup_range_selector']:checked").prop("name") == 0) ? true : false
					obj.set('dateRange', date_range);	
					if(date_range){
						var upper_range = elem.find(".chart_filter_upper_range").find("input").val();
						var lower_range = elem.find(".chart_filter_lower_range").find("input").val();
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
					}else{
						obj.set('upperRange', null);	
						obj.set('lowerRange', null);	
						obj.set('referenceCount', this.get('reference_count'));
						obj.set('referenceUnit', this.get('reference_unit'));
						if(this.get('reference_date_today')){
							obj.set('referenceDate', null);	
						}else{
							var ref_date=elem.find(".chart_filter_reference_date").find("input").val();
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
					}
					
					obj.on('didUpdate', function() {
						parent.get('controller').get('content').draw();
					});
					obj.get('store').commit();	
					this.closeChartFilter();
				}else{
					var obj = this.get('content');
					var parent = this;
					var selectedValues=$("#"+parent.get('chartFilterValuesId')).find(".select_box_multiselect").val();
					obj.set('fieldValues', JSON.stringify(selectedValues));
					obj.on('didUpdate', function() {
						$("#"+parent.elementId).tooltip('destroy');
						$("#"+parent.elementId).tooltip({'placement':'bottom',title:JSON.parse(obj.get('fieldValues')),trigger:'hover' });
						parent.get('controller').get('content').draw();
					})
					obj.get('store').commit();	
					this.closeChartFilter();
				}
			},

			closeChartFilter: function() {				
				var elemId = this.get('elementId');
				if(!elemId) {
					return;
				}
				var view_elem = $("#" + elemId),
				dropdown_menu = view_elem.find(".dropdown-menu")	;
				dropdown_menu.toggle();				
			},

			rangeFilterPopoverId: function() {
	   	  		return 'range-filter-popover' + this.get('content').id;
	  	  	}.property(''),

	  	  	is_specific_date: function(){
				if(this.get('specific_date')){
					this.set('reference_date_option', false);
			    	// this.set('predefined_range', false);
			    }
			}.observes('specific_date'),

			is_reference_date_option: function(){
				if(this.get('reference_date_option')){
					this.set('specific_date', false);
		    		// this.set('predefined_range', false);
		    	}
			}.observes('reference_date_option'),

			// is_predefined_range: function(){
			// 	if(this.get('predefined_range')){
			// 		this.set('specific_date', false);
		 //    		this.set('reference_date_option', false);
		 //    	}
			// }.observes('predefined_range'),

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
		    	}else{
		    		this.set('specific_date', false);
		    		this.set('reference_date_option', true);
		    	}
	    	},

	    	specific_date: function(){
				var content = this.get('content');
				return content.get('dateRange');
			}.property(''),

			upper_range: function(){
	    		var date = this.get('content').get('upperRange');
	    		return date.toLocaleString();
	    	}.property(''),

	    	lower_range: function(){
	    		var date = this.get('content').get('lowerRange');
	    		return date.toLocaleString();
	    	}.property(''),

	    	reference_date_option: function(){
				var content = this.get('content');
				return !content.get('dateRange');
			}.property(''),

			reference_count: function(){
				return this.get('content').get('referenceCount');
	    	}.property(''),	

	    	reference_unit: function(){
	    		return this.get('content').get('referenceUnit');
	    	}.property(''),	

	    	reference_date_today: function(){
	    		var flag = (this.get('content').get('referenceDateToday') == 'true') ? true : false 
	    		return flag;
	    	}.property(''),	

	    	reference_date: function(){
	    		var date = this.get('content').get('referenceDate');
	    		// if(date != null){
	    			return date.toLocaleString();
	    		// }	    		
	    	}.property(''),
	    	

		})
			
	}),

	chartFiltersView: Em.View.extend({
		templateName: 'charts/controls/chart_filters',
		filters: [],
		period_unit: ['Days', 'Weeks', 'Months', 'Quarters', 'Years', 'Date'],

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

		period: function(){
			var formats=['Month', 'Quarter', 'Year', 'Month Year', 'Day', 'Week', 'Date'];
			if(this.get('fieldType').toLowerCase().trim() == 'datetime'){
				formats.push('Hours');
				formats.push('Date');
			}
			return formats;
		}.property('fieldType'),

		fieldType: function() {
			return this.get('controller').fieldType(this.get('field_name'));
		}.property('field_name'),

		dateTypeField: function() {
			var field_type = this.get('fieldType');
			if(field_type && (field_type.toLowerCase().trim() == 'date' || field_type.toLowerCase().trim() == 'datetime')) {
				return true;
			}
			return false;
		}.property('fieldType'),

		operators: function() {
			var ops=Cibi.ChartFilter.prototype.operatorsMap;
			var obj = this;
			if(obj.get('field_name') && obj.get('dateTypeField')){
				ops = ops.concat([{display: "range", value: 5}]);
			}
			return ops;
		}.property('field_name','fieldType'),

		set_chart_filter: function() {
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
					var format_as = this.get('format_as');
					obj.set('valuesLoading',true);
					controller.getDimensionUniqueVals(field_name, obj.rebuild_select_box, obj, format_as);	
				} else if(obj.get('range_comparison')){
		    		elem.html("");
		    	} else {
					elem.html("<input class='select_box_multiselect input-small' type='number' />");
				}
			}
		}.observes('field_name', 'comparison_operator', 'format_as'),

		in_comparison: function() {
			var comparison_operator = this.get('comparison_operator');
			return (comparison_operator == 0 || comparison_operator == 3);
		}.property('comparison_operator', 'isLoaded'),

		not_null: function() {
			var comparison_operator = this.get('comparison_operator');
			return comparison_operator == 4
		}.property('comparison_operator', 'isLoaded'),

		max_min: function() {
			var comparison_operator = this.get('comparison_operator');
			return (comparison_operator == 6 || comparison_operator == 7);
		}.property('comparison_operator', 'isLoaded'),		

		format_as: function() {
			return this.get('controller').get('content').get('formatAs');
		}.property(''),

		filterValuesId: function() {
			return "chart-filter-" + this.get('controller').get('id');
		}.property('controller.id'),

		rebuild_select_box: function(unique_vals, obj) {
			//var obj = this;
			var es = Date.now()
			var elem = $("#" + obj.get('filterValuesId'));
			if(obj.get('not_null') || obj.get('max_min')){
				elem.html("");
				return
			}	

			if(obj.get('in_comparison')) {
				elem.html("<select class='select_box_multiselect' multiple='multiple' style='display:none'></select>");

				var values = unique_vals.sort();
				if(obj.get('dateTypeField') 
					&& (obj.get('format_as') == 'Month' 
						|| obj.get('format_as') == 'Year' 
						|| obj.get('format_as') == 'Quarter' 
						|| obj.get('format_as')=='Month Year'
						|| obj.get('format_as')=='Hours'
						|| obj.get('format_as')=='Day'
						|| obj.get('format_as')=='Week'
						|| obj.get('format_as')=='Date')) {
					values = formatDates(obj.get('format_as'), values);
				}

				var select_box = elem.find(".select_box_multiselect");
				select_box.html("");
				var options_html = ""
				
		        for (var i = 0; i < values.length; i++) {		        	
		            options_html += '<option value="' + values[i] + '">' + values[i] + '</option>';
		        }
		        select_box.html(options_html);

				select_box.multiselect({
					classes: 'multiselect_btn multiselect_menu',
					checkAllText: 'All',
					uncheckAllText: 'None'
				}).multiselectfilter();
			} else {
				elem.html("<input class='select_box_multiselect input-small' type='number' />");
			}
			obj.set('valuesLoading',false);
			var ef = Date.now()
			var time = ef - es
			console.log('Time to build select box = ' + time.toString() + " ms");
		},

        didInsertElement: function() {
        	var obj = this;
        	var elem = $("#" + obj.get('elementId'));
    		var btn = elem.find('.filter_popover')
    		btn.tooltip();
    		btn.click(function(el) {
    			// var elem = $("#" + this.get('elementId'));
				$('.popover').each(function () {
					if(!$(this).is(elem.find('.popover'))){
						$(this).addClass("hidden");
						var childElems = $(this).children();
						for(var i = 0; i < childElems.length; i ++) {
							var e = $(childElems[i]);
							e.addClass("hidden");
						}	
					}					        		            
			    });
    			var left_pos=elem.parent().parent().position().left;
				var top_pos=elem.parent().offset().top+25;
			 	obj.togglePopover(left_pos, top_pos);
    		});
    		//obj.rebuild_select_box();
    		
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
			var filter_elem = elem.find(".select_box_multiselect")
			var filters = filter_elem.val();

			field_name = this.get('field_name'),
			format_as = this.get('format_as'),
			data_type = '',
			display_name = this.get('display_name'),
			comparison_operator = this.get("comparison_operator"),
			is_global = this.get("is_global");

			var data = {};

			var date_range	= this.$('.range_selector:checked').prop("name");

			if(date_range == 0){
				var lower_range = elem.find("#chart_lower_range").find("input").val();
				var upper_range = elem.find("#chart_upper_range").find("input").val();
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
			}

			var filter_hash = this.get('controller').get('content').get('chartsDataSources').objectAt(0).get('dataSource').get('fieldsHash');
			filter_hash.forEach(function(h) {
				if(h.name == field_name){
					data_type = h.data_type;
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
			this.get('controller').send('set_filters', data);
			this.set('comparison_operator', null);
			this.set('field_name', null);	
			this.set('display_name', null);	
			this.set('is_global', false);
            this.togglePopover();
		},


		cancel:function(){
			$("#"+this.get('elementId')).find('.filter_popover').click();
			this.set('field_name', null);
			this.set('comparison_operator', null);
			$("#" + this.get('filterValuesId')).html(" ");
			return false;
		},

		checkedObserver: function() {
			alert(this.get('field'));
		},

		deleteFilter: function(filter) {
			var obj = this;
			filter.on('didDelete', function() {
				//obj.togglePopover();
				obj.set('successMessage', "Filter Deleted!");
				setTimeout(function() {
    				obj.set('successMessage', null);
     			}, 3000);
     			obj.get('controller').send('draw');
			});

			filter.deleteRecord();
			filter.get('transaction').commit();
		},

		range_comparison: function() {
			var comparison_operator = this.get('comparison_operator');
			if(comparison_operator == 5){
				this.set('specific_date', true)
				return true;
			}				
		}.property('comparison_operator', 'isLoaded', 'field_name'),

		is_specific_date: function(){
			if(this.get('specific_date')){
				this.set('reference_date_option', false);
		    	// this.set('predefined_range', false);
		    }
		}.observes('specific_date'),

		is_reference_date_option: function(){
			if(this.get('reference_date_option')){
				this.set('specific_date', false);
	    		// this.set('predefined_range', false);
	    	}
		}.observes('reference_date_option'),

		// is_predefined_range: function(){
		// 	if(this.get('predefined_range')){
		// 		this.set('specific_date', false);
	 //    		this.set('reference_date_option', false);
	 //    	}
		// }.observes('predefined_range'),

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
	    	}else{
	    		this.set('specific_date', false);
	    		this.set('reference_date_option', true);
	    	}
    	},
	}),

	drillThroughView: Em.View.extend({
		templateName: 'charts/drill_through',

		didInsertElement: function() {
			var obj=this;
        	$('.drill_through_popover').tooltip();

        	var fields=obj.get('controller').get('content').get('drillThroughFields');
        	fields=(fields) ? fields.split(","): [];
        	var elem = $("#" + obj.get('elementId'));
        	var filter_elem = elem.find("ul.drill_through_fields li :checkbox");
			_.each(filter_elem,function(f){
				if(fields.contains(f.name)){
					f.checked=true
				}
			});
			if(obj.get('modalEnabled')){
				elem.find('.drill_through_popover').parent().attr('style','background-color:green');
			}

			var configs = JSON.parse(obj.get('controller').get('content').get('configs')) || {};
			var detailsDashboard = configs["detailsDashboardId"];
			obj.set("detailsDashboard", detailsDashboard);
        },

        fields: function(){
        	return (this.get('controller').get('content').get('dataSources').objectAt(0).get('getDataSourceFields'));
        }.property('content.dataSources'),

        modalEnabled:function(){
        	return this.get('controller').get('content').get('modalEnabled');
        }.property('content.modalEnabled'),

        dashboardList: function(){
        	var obj=this;
        	var dashboards;
        	var chart = obj.get('controller').get('content');
        	if(!chart) {
        		return;	
        	}
        	var dashboard = chart.get('dashboard');
			if(!dashboard) {
        		return;	
        	}        	
        	var vertical = dashboard.get('vertical');
        	if(vertical){
        		dashboards = vertical.get('dashboards');
        	}
        	return dashboards;
        }.property('controller.content.dashboard.vertical','controller.content.dashboard.vertical.dashboards.length'),

        click: function(el) {
			var elem = $("#" + this.get('elementId'));
			$('.popover').each(function () {
				if(!$(this).is(elem.find('.popover'))){
					$(this).addClass("hidden");				
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i ++) {
						var e = $(childElems[i]);
						e.addClass("hidden");
					}
				}		        		            
		    });

			if(el.target.className.indexOf('icon-tasks') == -1) {
				return;
			}
			// var elem = $("#" + this.get('elementId'));
			var popover_elem = elem.find(".popover");

			var left_pos=elem.parent().parent().position().left;
			var top_pos=elem.parent().offset().top+25;
			//var left_pos = el.pageX - 187.5;		
			//var top_pos = el.pageY + 15;
			this.togglePopover(left_pos, top_pos);
		},

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

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
			var obj=this;			
			var elem = $("#" + obj.get('elementId'));
			var fields=[];
			var filter_elem = elem.find("ul.drill_through_fields li :checkbox:checked");
			_.each(filter_elem,function(f){
				fields.push(f.name);
			});
			if(elem.find("div.popover #"+obj.get('controller').get('drillId'))[0].checked!=obj.get('controller').get('content').get('modalEnabled')){
				obj.get('controller').toggleDrill();
			}
			obj.get('controller').get('content').set('drillThroughFields',fields);

			var data = JSON.parse(obj.get('controller').get('content').get('configs')) || {};
			data["detailsDashboardId"] = obj.get('detailsDashboard');
			obj.get('controller').send('updateChartConfigs',data);

			// obj.get('controller').get('content').get('store').commit();
            obj.togglePopover();
		},
	}),

	forecastView: Em.View.extend({
		templateName: 'charts/forecast',
		supportedForecastMethods: ['ETS', 'HoltWinters', 'Arima', 'Auto Arima'],
		errorOptions: ['A','M','Z'],
		trendAndSeasonalityOptions: ['N','A','M','Z'],

		isETS: function(){
			var obj=this;
			if(obj.get('forecastObject').forecastMethod=="ETS"){
				return true;
			}
		}.property('forecastObject.forecastMethod'),

		isHoltWinters: function(){
			var obj=this;
			if(obj.get('forecastObject').forecastMethod=="HoltWinters"){
				return true;
			}
		}.property('forecastObject.forecastMethod'),

		isArima: function(){
			var obj=this;
			if(obj.get('forecastObject').forecastMethod=="Arima"){
				return true;
			}
		}.property('forecastObject.forecastMethod'),

		forecastObject: function(){
			var obj=this;
			var configs=obj.get('controller').get('content').get('configs');
			var configObj = JSON.parse((configs) ? configs : '{}');
			if(configObj["forecastObject"]){
				return configObj["forecastObject"];
			}
			else{
				return {};
			}
		}.property('controller.content.configs.forecastObject'),

		forecastPeriodFormat: function(){
			var obj=this;
			var format=obj.get('controller').get('content').get('chartsDataSources').objectAt(0).get('dimensionFormatAs');
			switch(format){
				case "Quarter":
					return "Quarter"+"(s)";
					break;
				case "Year":
					return "Year"+"(s)";
					break;
				case "Month Year":
					return "Month"+"(s)";
					break;
			}
		}.property('controller.content.chartsDataSources.dimensionFormatAs'),

		didInsertElement: function() {
			var obj=this;
        	$('.forecast_popover').tooltip();
        },

        click: function(el) {
			var elem = $("#" + this.get('elementId'));
			$('.popover').each(function () {
				if(!$(this).is(elem.find('.popover'))){
					$(this).addClass("hidden");				
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i ++) {
						var e = $(childElems[i]);
						e.addClass("hidden");
					}
				}		        		            
		    });
			if(el.target.className.indexOf('forecast_icon') == -1) {
				return;
			}
			var popover_elem = elem.find(".popover");
			var left_pos=elem.parent().parent().position().left;
			var top_pos=elem.parent().offset().top+25;
			this.togglePopover(left_pos, top_pos);
		},

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

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
			var obj=this;			
			var elem = $("#" + obj.get('elementId'));

			var forecastObject=obj.get('forecastObject');
			var forecastJson={};
			forecastJson.enableForecast = $(elem.find("input[id='"+obj.get('controller').get('drillId')+"']:checkbox")[0]).prop("checked");
			forecastJson.forecastPeriod=forecastObject.forecastPeriod;
			forecastJson.forecastMethod=forecastObject.forecastMethod;

			switch(forecastJson.forecastMethod){
				case "ETS":
					if(forecastObject.specifyETSModel){
						forecastJson.specifyETSModel=true;
						forecastJson.errorValue=forecastObject.errorValue;
						forecastJson.trendValue=forecastObject.trendValue;
						forecastJson.seasonalityValue=forecastObject.seasonalityValue;
					}
					else{
						forecastJson.specifyETSModel=false;
						forecastJson.errorValue="A";
						forecastJson.trendValue="N";
						forecastJson.seasonalityValue="N";
					}
					break;
				case "HoltWinters":
					if(forecastObject.specifyHoltWintersModel){
						forecastJson.specifyHoltWintersModel=true;
						forecastJson.alphaValue=forecastObject.alphaValue || "";
						forecastJson.betaValue=forecastObject.betaValue || "";
						forecastJson.gammaValue=forecastObject.gammaValue || "";
					}
					else{
						forecastJson.specifyHoltWintersModel=false;
						forecastJson.alphaValue="";
						forecastJson.betaValue="";
						forecastJson.gammaValue="";
					}
					break;
				case "Arima":
					if(forecastObject.specifyArimaModel){
						forecastJson.specifyArimaModel=true;
						forecastJson.orderValue=forecastObject.orderValue || "";
					}
					else{
						forecastJson.specifyArimaModel=false;
						forecastJson.orderValue="";
					}
					break;
			}

			var configObj = JSON.parse((obj.get('controller').get('content').get('configs')) ? obj.get('controller').get('content').get('configs') : '{}');
			
			configObj["forecastObject"]=forecastJson;

			obj.get('controller').get('content').set('configs', JSON.stringify(configObj));
			var c = obj.get('controller').get('content');
			c.on('didUpdate', function() {
				c.draw();
			})
			c.get('store').commit();
            obj.togglePopover();
		},

		forecastDetailsView: Em.View.extend({
			viewDetails: function(){
				var obj=this;
				var html="";
				if(obj.get('controller').get('content').get('isLoaded')){
					var json=obj.get('controller').get('content').get('forecastModel');
					html+="<div class='row'>";
					html+="<h5>Forecast Details</h5>"
					html+="<table>";
					_.each(json, function(value, key){
						html+="<tr>";
						html+= "<td>"+key.capitalize()+"</td>"+"<td style='padding-left:15px; padding-right:15px;'>:</td>"+"<td>"+value+"</td>";
						html+="</tr>";
					});	
					html+="</table></div>";
					$("#"+obj.get('elementId')).html(html);
				}
			}.observes('controller.content.forecastModel'),
		}),
	}),

	statisticalRelevanceView: Em.View.extend({
		templateName: 'charts/statistical_relevance',
		supportedComparisonFunctions: ['', 'P Value'],
		supportedComparisonOperators: ["", "equal","less than","greater than"],
		supportedTests: ['','T Test','Z Test'],
		supportedComparisonValues: [0.01,0.02,0.03,0.04,0.05],

		isPValue: function(){
			var obj=this;
			if(obj.comparison_function=="P Value"){
				return true;
			}else{
				return false;
			}
		}.property('comparison_function'),

		didInsertElement: function() {
			var obj=this;
        	$('.statistical_relevance_popover').tooltip();
			var hR=obj.get("controller").get("content").get("highlightRule");
			if(hR){
				var v=hR.get('comparison_value');
				obj.set("comparison_value", parseFloat(d3.format(".2f")(v)));
				obj.set("chart_id", hR.get('chart_id'));
				var configs=JSON.parse(hR.get('configs'));
				obj.set("test", configs.test);
				obj.set("control_field", configs.control_field);
				obj.set("comparison_function", hR.get('comparison_function').trim());
				obj.set("operator", hR.get('operator').trim());
				obj.set("enable_highlight", hR.get('enable_highlight'));
				obj.set("enable_sem", hR.get('enable_sem'));
			}
        },

        click: function(el) {
			var elem = $("#" + this.get('elementId'));
			$('.popover').each(function () {
				if(!$(this).is(elem.find('.popover'))){
					$(this).addClass("hidden");				
					var childElems = $(this).children();
					for(var i = 0; i < childElems.length; i ++) {
						var e = $(childElems[i]);
						e.addClass("hidden");
					}
				}		        		            
		    });
			if(el.target.className.indexOf('statistical_relevance_icon') == -1) {
				return;
			}
			var popover_elem = elem.find(".popover");
			var left_pos=elem.parent().parent().position().left;
			var top_pos=elem.parent().offset().top+22;
			this.togglePopover(left_pos, top_pos);
		},

		togglePopover: function(x, y) {
			var elem = $("#" + this.get('elementId'));

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

		submit: function(e){
			e.preventDefault();
			var obj=this;			
			var c = obj.get('controller').get('content');
			var hR=c.get("highlightRule");
			if(hR){
				obj.updateObject(c, hR);
			}else{
				obj.createObject(c);
			}
            obj.togglePopover();
		},

		createObject: function(chart){
			var obj=this;
			var elem = $("#" + obj.get('elementId'));
			var hR={};
			hR.comparison_function=obj.comparison_function;
			hR.operator = obj.operator;
			hR.comparison_value=obj.comparison_value;
			hR.chart_id=chart.get('id');
			hR.enable_highlight=obj.enable_highlight;
			hR.enable_sem=obj.enable_sem;
			var configs={};
			configs.test=obj.test;
			configs.control_field=obj.control_field;
			hR.configs = JSON.stringify(configs);
			var cHR = Cibi.HighlightRule.createRecord(hR);
	    	cHR.on('didCreate', function(rule) {
	    		chart.draw();
	    	});
	    	cHR.set('chart', chart);
	    	cHR.get('store').commit();
		},

		updateObject: function(chart, rule){
			var obj=this;
			var elem = $("#" + obj.get('elementId'));
			rule.set("comparison_function", obj.comparison_function);
			rule.set("operator", obj.operator);
			rule.set("comparison_value", obj.comparison_value);
			rule.set("chart_id", chart.get('id'));
			rule.set("enable_highlight", obj.enable_highlight);
			rule.set("enable_sem", obj.enable_sem);
			var configs={};
			configs.test=obj.test;
			configs.control_field=obj.control_field;
			rule.set("configs", JSON.stringify(configs));

			rule.on('didUpdate', function(rule){
				chart.draw();
			});
			rule.get('store').commit();
		}
	}),

	pivotConfigsView: Em.View.extend({
		templateName: 'charts/pivot_configs',

		fields: function(){
			if(this.get('controller').get('content').get('chartsDataSources').objectAt(0).get('dataSource')){
				var fields=this.get('controller').get('content').get('chartsDataSources').objectAt(0).get('dataSource').get('getDataSourceFields');
				var row_fields=this.get('row_fields');
				var column_fields=this.get('column_fields');
				var measure_fields=this.get('measure_fields');
				var measureFields=[];
				_.each(measure_fields,function(m){ 
					measureFields.push(m["field"]); 
				});
				return _.difference(fields, row_fields, column_fields, measureFields);
			}			
				// return this.get('controller').get('content').get('chartsDataSources').objectAt(0).get('dataSource').get('getDataSourceFields');
		}.property('controller.content.isSetup', 'row_fields', 'column_fields', 'measure_fields'),

		row_fields:function(){
			return (this.get('controller').get('content').get('configs')) ? JSON.parse(this.get('controller').get('content').get('configs')).hierarchy : "";
		}.property('controller.content.isSetup', 'controller.content.configs'),

		column_fields:function(){
			return (this.get('controller').get('content').get('configs')) ? JSON.parse(this.get('controller').get('content').get('configs')).column_fields : "";
		}.property('controller.content.isSetup', 'controller.content.configs'),

		measure_fields:function(){
			return (this.get('controller').get('content').get('configs')) ? JSON.parse(this.get('controller').get('content').get('configs')).measure_fields : "";
		}.property('controller.content.isSetup', 'controller.content.configs'),

		measure_fields_arr: function(){
			var measure_fields=this.get('measure_fields');
			if(measure_fields){
				var arr=[];
				_.each(measure_fields,function(m){
					var measure={};
					measure["content"]=[];
					measure["content"].push("Sum("+m.field+")");
					measure["content"].push("Avg("+m.field+")");
					measure["content"].push("Count("+m.field+")");
					measure["content"].push("Count Unique("+m.field+")");
					measure["value"]=((m.format=="Count,Distinct") ? "Count Unique" : m.format)+"("+m.field+")";
					arr.push(measure);
				});
				return arr;	
			}			
		}.property('measure_fields'),

		applyPivotConfigs: function(){
			var obj=this;
			var elem=$("#"+this.get('elementId'));
			var configObj = JSON.parse((obj.get('controller').get('content').get('configs')) ? obj.get('controller').get('content').get('configs') : '{}');
			
			var rows=[];
			_.each((elem.find("#row_fields")).find("li"),function(l){
				if(!($(l).attr("class").split(" ").contains("placeholder"))){
					rows.push($(l).text().trim());
				}
			});
			configObj["hierarchy"]=rows;

			var columns=[];
			_.each((elem.find("#column_fields")).find("li"),function(l){
				if(!($(l).attr("class").split(" ").contains("placeholder"))){
					columns.push($(l).text().trim());
				}
			});
			configObj["column_fields"]=columns;

			var measures=[];
			_.each((elem.find("#measure_fields")).find("li"),function(l){
				if(!($(l).attr("class").split(" ").contains("placeholder"))){
					var measure={};
					var text=$(l).find("option:selected").text().trim().split("(");
					measure["field"]=text[1].replace(")","");
					measure["format"]=(text[0]=="Count Unique") ? "Count,Distinct" :text[0];
					measures.push(measure);					
				}
			});
			configObj["measure_fields"]=measures;

			configObj["display_total"]=elem.find("input:checkbox").prop("checked");

			obj.get('controller').get('content').set('configs', JSON.stringify(configObj));	

			obj.get('controller').get('content').get('store').commit();	
			$("#"+obj.get('controller').get('content').get('containerId')).find("#modal-pivot-configs").modal("toggle");
		},

		deleteField: function(elem){
			var obj=this;
			console.log(elem);
			var configObj = JSON.parse((obj.get('controller').get('content').get('configs')) ? obj.get('controller').get('content').get('configs') : '{}');
			if($(event.target).closest("ul").attr("id")=="row_fields"){
	        	configObj["hierarchy"]=_.without(configObj["hierarchy"], elem);
			}
			else if($(event.target).closest("ul").attr("id")=="column_fields"){
	        	configObj["column_fields"]=_.without(configObj["column_fields"], elem);
			}
			else if($(event.target).closest("ul").attr("id")=="measure_fields"){
				var m=_.find(configObj["measure_fields"],function(m){
					return ((m.format+"("+m.field+")")==elem.value);
				});
				configObj["measure_fields"]=_.without(configObj["measure_fields"], m);
			}
			obj.get('controller').get('content').set('configs', JSON.stringify(configObj));
		}
	}),

	descriptionView: Em.View.extend({
		templateName: 'charts/chart_description',

		didInsertElement: function() {
			var obj=this;
        	$('.description_popover').tooltip();
        	obj.attachPopover();       	
        },

		attachPopover: function() {
			var controller = this.get('controller').get('content');
			var dashboard = controller.get('dashboard');
			var chartWidth = dashboard.getBlockWidth();
			var noCols = dashboard.get("columns");
			if(noCols < 3){
				var width = "270px;";
			}else if(noCols > 6){
				var width = chartWidth + 20 +"px;";
			}else{
				var width = chartWidth - 60 +"px;";
			}

			$(".description_popover").popover({
				html : true,
				content: function() {
					var html = "<div style=\"height: auto; width:"+ width + "overflow: auto;\">";
					html += $(this).find("#list_comments").html();
					html += $(this).find("#new_comment").html();
					html += "</div>"
				  	return html;
				},
				placement: "left",
			}).click(function(e) {
				 var elem = $(this);
				e.preventDefault();
				$('.popover').each(function () {
					var target=elem;
					 if(!($(this).find('.popover-title').text()=="Chart description")){
						$(this).addClass("hidden");				
						var childElems = $(this).children();
						for(var i = 0; i < childElems.length; i ++) {
							var a = $(childElems[i]);
							a.addClass("hidden");
						}
					 }
					 else{
					 	if($(this.parentElement).find('a')[0].id==target[0].id)
					 	{
					 		$(this).removeClass('hidden');
						 	var childElems = $(this).children();
							for(var i = 0; i < childElems.length; i ++) {
								var a = $(childElems[i]);
								a.removeClass("hidden");
							}
					 	}
					 	else
					 	{
					 		$(this).addClass("hidden");				
							var childElems = $(this).children();
							for(var i = 0; i < childElems.length; i ++) {
								var a = $(childElems[i]);
								a.addClass("hidden");
							}
					 	}					
					}
			    });
				
			}); 			
		},
	}),
});
