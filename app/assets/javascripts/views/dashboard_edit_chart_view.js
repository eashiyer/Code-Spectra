Cibi.DashboardEditChartView = Ember.View.extend({
	didInsertElement: function(){
		var obj = this;
		var chart = obj.get('controller').get('content');
		var count = chart.get('chartsDataSources').objectAt(0).get('count');
		var chart_name = getChartName(chart.get('chartType'));
		var title = chart.get('title');
		var subtitle = chart.get('subtitle');
		var description = chart.get('description');
		var isolated = chart.get('isolated');

		obj.$().find('.title').val(title);
		obj.$().find('.subtitle').val(subtitle);
		obj.$().find('.count').val(count);
		obj.set('description', description);
		obj.set('isolated',isolated);
		// obj.$().find('.isolated').val(isolated);
		obj.$().find('button[value='+chart_name+']').addClass("active");		
	},

	dataSourceId: function(){
		var obj = this;
		var datasource_id = obj.get('controller').get('content').get('dataSources').objectAt(0).id
		return datasource_id;
	}.property(''),

	fieldsArr: function() {
		var dataSourceId = this.get('dataSourceId');
		if(!dataSourceId) {
			return [];
		}
		if( dataSourceId !== this.get('event_attached_for_fields')) {
			if(this.get('chartDimensionsContainerView')){
				this.get('chartDimensionsContainerView').clear_all_dimensions();
			}
			if(this.get('chartRowsContainerView')){
				this.get('chartRowsContainerView').clear_all_rows();
			}
			if(this.get('chartColumnsContainerView')){
				this.get('chartColumnsContainerView').clear_all_columns();
			}
			if(this.get('chartMeasuresContainerView')){
				this.get('chartMeasuresContainerView').clear_all_measures();	
			}			
			//this.get('chartSortFieldsContainerView').clear_all_sort_fields();	
		}
		

		var fields = this.get('controller').getFields(dataSourceId);
		return [''].concat(fields);
	}.property('dataSourceId'),

	toShowRowsAndCols: function(){
		if(this.get('chartType') == undefined){
			var chart_number = this.get('controller').get('content').get('chartType')
		}		
		if(this.get('chartType')=="grouped_table" || chart_number == "14"){
			return true;
		}
		else{
			return false;
		}
	}.property('this.chartType'),

	chartMeasures: function() {
		return ['field3', 'field3'];
	}.property(''),

	submit: function(e) {
		var obj = this;
		e.preventDefault();
		var title			   = this.get('title') || this.$().find(".title").val();
		var subtitle		   = this.get('subtitle') || this.$().find(".subtitle").val();
		var description		   = this.get('description') || this.$().find(".description").val();
		var chartType		   = this.get('chartType') || this.$().find(".active").val();
		var count=this.get('count');
		var isolated = this.get('isolated')||this.$(".isolated").is(':checked');

		var chartsDataSources = [];
		//var dataSource = this;
		if(chartType == null) {
			var notice_elem = $("#new-chart-notice")
			notice_elem.html('Please select a chart type.');
			notice_elem.addClass('alert alert-error');
			notice_elem.fadeIn().delay(10000).fadeOut();
			return;
		}

		var cds = {};
		cds.data_source_id = this.get('dataSourceId');
		cds.count=count;
		cds.isolated = isolated;
		chartsDataSources.push(cds);

		var c = obj.get('controller').get('content');
		var configs = c.get('configs');
		c.set('title', title);
		c.set('subtitle', subtitle);
		c.set('description', description);
		c.set('chartType', getChartNumber(chartType));
		c.set('chartsDataSourcesStr', JSON.stringify(chartsDataSources));
		var dashboard_charts_controller = this.get('controller');
		var dashboard = this.get('controller').get('content').get('dashboard');
		c.set('dashboard', dashboard);
		c.set('updatedBy', Cibi.Auth.get('currentUser').get('fullName'));
		c.set('isolated',isolated);

		dimensionObj = [];
		measuresObj = [];
		var configObj = JSON.parse(configs || '{}');			
		if(chartType=="grouped_table" || chartType=="14"){
			
			var rows=[];
			var columns=[];
			var measures=[];

			for(i=1;i<this.chartRowsContainerView._childViews.length;i++){
				dimensionObj.push({
					'field_name' : this.chartRowsContainerView._childViews[i].get('field_name'), 
					'format_as' : this.chartRowsContainerView._childViews[i].get('format_as'),
					'display_name' : this.chartRowsContainerView._childViews[i].get('field_display'),
					'is_row' : this.chartRowsContainerView._childViews[i].get('is_row'),
					'sort_order' : this.chartRowsContainerView._childViews[i].get('sort_order'),
					'field_id' : this.chartRowsContainerView._childViews[i].get('field_id'),
					'rank' : this.chartRowsContainerView._childViews[i].get('rank')
				});
			}

			for(k=1;k<this.chartColumnsContainerView._childViews.length;k++){
				dimensionObj.push({
					'field_name' : this.chartColumnsContainerView._childViews[k].get('field_name'), 
					'format_as' : this.chartColumnsContainerView._childViews[k].get('format_as'),
					'display_name' : this.chartColumnsContainerView._childViews[k].get('field_display'),
					'is_row' : this.chartColumnsContainerView._childViews[k].get('is_row'),
					'sort_order' : this.chartColumnsContainerView._childViews[k].get('sort_order'),
					'field_id' : this.chartColumnsContainerView._childViews[k].get('field_id'),
					'rank' : this.chartColumnsContainerView._childViews[k].get('rank')
				});
				// columns.push(this.chartColumnsContainerView._childViews[k].get('field_display'));
			}

			var sortedDimension =_.sortBy(dimensionObj,function(d){
									return d.rank;
								});

			for(var r=0;r<sortedDimension.length;r++){
				if(sortedDimension[r]['is_row'] == true){
					rows.push(sortedDimension[r].display_name);	
				}else{
					columns.push(sortedDimension[r].display_name);
				}
			}

			for(j=1;j<this.chartMeasuresContainerView._childViews.length;j++){
				measuresObj.push({
					'field_name' : this.chartMeasuresContainerView._childViews[j].get('field_name'), 
					'format_as' : this.chartMeasuresContainerView._childViews[j].get('format_as'),
					'display_name' : this.chartMeasuresContainerView._childViews[j].get('field_display'),
					'sort_order' : this.chartMeasuresContainerView._childViews[j].get('sort_order'),
					'field_id' : this.chartMeasuresContainerView._childViews[j].get('field_id'),
					'is_calculated' : this.chartMeasuresContainerView._childViews[j].get('is_calculated'),
					'prefix' : this.chartMeasuresContainerView._childViews[j].get('prefix'),
					'suffix' : this.chartMeasuresContainerView._childViews[j].get('suffix')    					
				});
				var measure={};
				measure["fieldName"]=this.chartMeasuresContainerView._childViews[j].get('field_name');
				measure["formatAs"]=(this.chartMeasuresContainerView._childViews[j].get('format_as')=="Count Unique") ? "Count,Distinct" : this.chartMeasuresContainerView._childViews[j].get('format_as');
				measure["displayName"]=this.chartMeasuresContainerView._childViews[j].get('field_display');
				measure["sortOrder"]=this.chartMeasuresContainerView._childViews[j].get('sort_order');
				measure["is_calculated"] = this.chartMeasuresContainerView._childViews[j].get('is_calculated'),
				measure["prefix"]=this.chartMeasuresContainerView._childViews[j].get('prefix');
				measure["suffix"]=this.chartMeasuresContainerView._childViews[j].get('suffix');
				measures.push(measure);
			}
			configObj["hierarchy"]=rows;
			configObj["column_fields"]=columns;
			configObj["measure_fields"]=measures;
		}
		else{
			for(i=1;i<this.chartDimensionsContainerView._childViews.length;i++){
				var sort_order=(chartType=="single_value" || chartType == "15") ? "DESC" : this.chartDimensionsContainerView._childViews[i].get('sort_order')
				dimensionObj.push({
					'field_name' : this.chartDimensionsContainerView._childViews[i].get('field_name'), 
					'format_as' : this.chartDimensionsContainerView._childViews[i].get('format_as'),
					'display_name' : this.chartDimensionsContainerView._childViews[i].get('field_display'),
					'sort_order' : sort_order,
					'field_id' : this.chartDimensionsContainerView._childViews[i].get('field_id'),
					'rank' : this.chartDimensionsContainerView._childViews[i].get('rank')
				});
			}

			for(j=1;j<this.chartMeasuresContainerView._childViews.length;j++){
				measuresObj.push({
					'field_name' : this.chartMeasuresContainerView._childViews[j].get('field_name'), 
					'format_as' : this.chartMeasuresContainerView._childViews[j].get('format_as'),
					'display_name' : this.chartMeasuresContainerView._childViews[j].get('field_display'),
					'sort_order' : this.chartMeasuresContainerView._childViews[j].get('sort_order'),
					'field_id' : this.chartMeasuresContainerView._childViews[j].get('field_id'),
					'is_calculated' : this.chartMeasuresContainerView._childViews[j].get('is_calculated'),
					'prefix' : this.chartMeasuresContainerView._childViews[j].get('prefix'),
					'suffix' : this.chartMeasuresContainerView._childViews[j].get('suffix')    
				});
			}		
		}
		c.set('configs', JSON.stringify(configObj));
		if(dimensionObj.length > 0){
			c.set('chartDimensionsStr', JSON.stringify(dimensionObj));
		}
		if(measuresObj.length > 0){
			c.set('chartMeasuresStr',JSON.stringify(measuresObj));
		}		

		var msg=this.checkChartConfigs(chartType, dimensionObj, measuresObj);
		if(msg){
			var notice_elem = $("#new-chart-notice")
			notice_elem.html(msg);
			notice_elem.addClass('alert alert-error');
			notice_elem.fadeIn().delay(10000).fadeOut();
			return;
		}
		else{
			var chart = c;
			var previous_cds_id = obj.get('controller').get('content').get('dataSources').objectAt(0).id
			if(previous_cds_id != obj.get('dataSourceId')){
				chart.get('dimensions').forEach(function(d){
					d.deleteRecord();
				});
				chart.get('measures').forEach(function(m){
					m.deleteRecord();
				});					
			}else{
				if(obj.get('deleted_dimensions')){
					_.compact(obj.get('deleted_dimensions')).forEach(function(d){
						Cibi.Dimension.find(d).deleteRecord();
					});				
				}
				if(obj.get('deleted_measures')){
					_.compact(obj.get('deleted_measures')).forEach(function(m){
						Cibi.Measure.find(m).deleteRecord();
					});					
				}					
			}
	
			chart.on('didUpdate', function() {
				var dashboard_id = dashboard.get('id');
				chart.get('dimensions').forEach(function(d){
					if (d.get('stateManager.currentState.name') !== 'reloading') {
						d.reload();
					}
				});
				chart.get('measures').forEach(function(m){
					if (m.get('stateManager.currentState.name') !== 'reloading') {
						m.reload();
					}
				});	
				var chartds = chart.get('chartsDataSources').objectAt(0)
				if (chartds.get('stateManager.currentState.name') !== 'reloading') {
					chartds.reload();	
				}		
				var charts = Cibi.Chart.find({dashboard_id: dashboard_id}).then(function(charts) {
					dashboard_charts_controller.set('model', charts);
					dashboard_charts_controller.transitionToRoute('dashboard.charts', dashboard);
				});								
				if (dashboard.get('stateManager.currentState.name') !== 'reloading') {
					dashboard.reload();
				}
			});
			var transaction = chart.get('transaction');
			this.removeDummyObjectsFromTransaction(transaction);			
			transaction.commit();
		}		
	},


	checkChartConfigs:function(chartType, dimensionObj, measuresObj){
		var dimensionsLength=dimensionObj.get('length');
		var measuresLength=measuresObj.get('length');
		var dsid=this.get('dataSourceId');
		var ds = Cibi.DataSource.find(dsid);
		
		switch(chartType){
			case "1": // Bar Chart
			case "bar":
				if(measuresLength<1){
					return "Bar chart requires atleast 1 measure";
				}
		        else if(dimensionsLength<1){
		        	return "Bar chart requires atleast 1 dimension";
		        }
		        else if(dimensionsLength>2){
		        	return "Bar chart can have atmost 2 dimensions";
		        }
		        else if(dimensionsLength==2 && measuresLength>1){
		        	return "In Bar chart 2 dimensions can have only 1 measure";
		        }
				break;
			case "horizontal-bar": // Horizontal Bar Chart
			case "10":
			case "hbar":
				if(measuresLength<1 || dimensionsLength<1){
					return "Horizontal bar chart requires atleast 1 dimension and 1 measure";
				}
				else if(measuresLength>1){
					return "Horizontal bar chart can have atmost 1 measure";
				}
				else if(dimensionsLength>2){
					return "Horizontal bar chart can have atmost 2 dimensions";
				}
				break;
			case "2": // Pie Chart
			case "pie":
				if(measuresLength<1){
					return "Pie chart requires atleast 1 measure";
				}
				else if(dimensionsLength>1){
					return "Pie chart can have atmost 1 dimension";
				}
				else if(dimensionsLength==1 && measuresLength>1){
					return "For 1 dimension Pie chart can have only 1 measure";
				}
				break;
			case "7": // Table
			case "table":
				
				break;
			case "3": // C Tree
			case "ctree":
				if(measuresLength!=1 || dimensionsLength<1){
		        	return "CTree requires 1 measure and atleast 1 dimension";
		        }
				break;
			case "0": // C Table
			case "ctable":
				if(measuresLength<1){
					return "CTable requires atleast 1 measure";
				}
				else if(dimensionsLength<1){
					return "CTable requires atleast 1 dimension";
				}
				// else if(measuresLength>1){
				// 	return "CTable can have atmost 1 measure";
				// }
				break;
			case "5": // Heat Map
			case "heatmap":
				var allFormatSet=true, is_calculated = false;
				measuresObj.forEach(function(m){
					if(!m.format_as && !m.is_calculated){
						allFormatSet=false;
					}
				});
				if(!allFormatSet){
					return "Need to specify format for each measure";
				}
				else if(dimensionsLength<2 || measuresLength <1){
					return "Heatmap requires 2 dimensions and atleast 1 measure";
				}
				else if(measuresLength>2){
					return "Heatmap can have atmost 2 measures";
				}
				break;
			case "4": // Geo Map
			case "geo":
				
				break;
			case "6": // Combo Chart
			case "combo":
				
				break;
			case "8": // Line Chart
			case "line":
				if(!(dimensionsLength == 1 && measuresLength == 1)){
					return "Line chart requires 1 dimension and 1 measure";
				}
				break;
			case "9": // Multiline Chart
			case "multiline":
				if(measuresLength<1){
					return "Multiline chart requires atleast 1 measure";
				}
		        else if(dimensionsLength<1){
		        	return "Multiline chart requires atleast 1 dimension";
		        }
		        else if(dimensionsLength==1 && measuresLength==1){
		        	return "For Multiline chart 2 dimensions or multiple measures are required";
		        }
		        else if(dimensionsLength>2){
		        	return "Multiline chart can have atmost 2 dimensions";
		        }
		        else if(dimensionsLength==2 && measuresLength>1){
		        	return "In Multiline chart 2 dimensions can have only 1 measure";
		        }
				break;
			case "11": // Area Chart
			case "area":
				if(!(dimensionsLength == 1 && measuresLength == 1)){
					return "Area chart requires 1 dimension and 1 measure";
				}
				break;
			case "12": // Stacked Area Chart
			case "stacked_area":
				if(dimensionsLength==1 && measuresLength==1){
		        	return "Stacked Area chart requires atleast 2 dimensions or more than two measures";
		        }
		        else if(measuresLength<1 && dimensionsLength<1){
					return "Stacked Area chart requires atleast 1 measure or atleast 1 dimension";
				}
		        else if(dimensionsLength==2 && measuresLength>1){
		        	return "In Stacked Area Chart 2 dimensions can have only 1 measure";
		        }else if(dimensionsLength==1 && measuresLength==1){
		        	return "For Stacked Area chart 2 dimensions or multiple measures are required";
		        }
				break;
			case "13": // Scatter Plot
			case "scatter_plot":
				if(measuresLength<1){
					return "Scatter plot requires atleast 1 measure";
				}
		        else if(dimensionsLength<1){
		        	return "Scatter plot requires atleast 1 dimension";	
		        }
		        else if(dimensionsLength>2){
		        	return "Scatter plot can have atmost 2 dimensions";
		        }
		        else if(dimensionsLength==2 && measuresLength>1){
		        	return "In Scatter plot 2 dimensions can have only one measure";
		        }
				break;
			case "14": // Grouped Table Chart
			case "grouped_table":
				
				break;
			case "15": // Single Value Chart
			case "single_value":
				if(dimensionsLength >1 || measuresLength!=1){
					return "Single value chart requires only a measure and a dimension";
  				}else if(dimensionsLength == 1){
  					var dimension=dimensionObj.objectAt(0)['field_name'];
  					if(!(ds.getDataType(dimension) == 'date' || ds.getDataType(dimension) == 'datetime')){
  						return "Single Value Chart only supports dimensions of Date or Datetime type";
  					}
  				}

			case "17": // Donut Chart
			case "donut":
				if(measuresLength<1){
					return "Donut chart requires atleast 1 measure";
				}
				else if(dimensionsLength>1){
					return "Donut chart can have atmost 1 dimension";
				}
				else if(dimensionsLength==1 && measuresLength>1){
					return "For 1 dimension Donut chart can have only 1 measure";
				}
				break;
			case "18": // Funnel Chart
			case "funnel":
				if(measuresLength<1){
					return "Funnel chart requires atleast 1 measure";
				}
				else if(dimensionsLength>1){
					return "Funnel chart can have atmost 1 dimension";
				}
				else if(dimensionsLength==1 && measuresLength>1){
					return "For 1 dimension Funnel chart can have only 1 measure";
				}
				break;

			case "20": //Gauge Chart
			case "gauge":
				if(measuresLength<1){
					return "Gauge Chart requires atleast 1 measure";
				}
				else if(measuresLength > 1){
					return "Gauge Chart requires only 1 measure";
				}						
				break;					
		}
	},

	attach_drag_n_drop_events: function() {
		// attach drag events
		var chartType=this.get('chartType');
		var currentDataSourceId = this.get('dataSourceId');
		this.attach_drag_events(currentDataSourceId);
		this.attach_drop_events(currentDataSourceId);
		this.set('drag_and_drop_attached', true);
	}.observes('this.chartType'),

	attach_drag_events: function(currentDataSourceId) {
		if(this.get('drag_event_attached') && currentDataSourceId == this.get('event_attached_for_fields')) {
			return;
		}

		$("li.draggable-field").draggable({
			revert: "invalid", 
			helper: "clone"
		});

		console.log('event_attached');
		
		this.set('drag_event_attached', true);
		this.set('event_attached_for_fields', this.get('dataSourceId'));
	},

	// populateEditFields: function(){
	// 	var obj = this;
	// 	if(this.get('drag_and_drop_attached') != true){
	// 		return;
	// 	}
	// 	obj.get('controller').get('content').get('dimensions').forEach(function(d){
	// 		obj.add_field_to_chart_dimensions(d.get('fieldName'),d.get('displayName'),d.get('formatAs'),d.get('sortOrder'),d.get('id'));
	// 	});
	// 	obj.get('controller').get('content').get('measures').forEach(function(m){
	// 		obj.add_field_to_chart_measures(m.get('fieldName'),m.get('displayName'),m.get('formatAs'),m.get('sortOrder'),m.get('id'));
	// 	});		
	// }.observes('drag_and_drop_attached'),

	attach_drop_events: function(currentDataSourceId) {
		var obj = this;
		// if(this.get('drop_event_attached')) {
		// 	return;
		// }

		$("li.dimension").droppable({
			activeClass: "droppable-area-active",
			hoverClass: "droppable-area-hover",
			drop: function(event, ui) {
				if(ui.helper.hasClass('ui-draggable')){
					var field_name = ui.draggable.text().trim();
					obj.add_field_to_chart_dimensions(field_name);
				}
			},
		});	

		$("li.row").droppable({
			activeClass: "droppable-area-active",
			hoverClass: "droppable-area-hover",
			drop: function(event, ui) {
				if(ui.helper.hasClass('ui-draggable')){
					var field_name = ui.draggable.text().trim();
					obj.add_field_to_chart_rows(field_name);
				}
			},
		});	

		$("li.column").droppable({
			activeClass: "droppable-area-active",
			hoverClass: "droppable-area-hover",
			drop: function(event, ui) {
				if(ui.helper.hasClass('ui-draggable')){
					var field_name = ui.draggable.text().trim();
					obj.add_field_to_chart_columns(field_name);
				}
			},
		});		

		$("li.measure").droppable({
			activeClass: "droppable-area-active",
			hoverClass: "droppable-area-hover",
			drop: function(event, ui) {
				var field_name = ui.draggable.text().trim();
				obj.add_field_to_chart_measures(field_name);
			},
		});		

		$("li.sort-field").droppable({
			activeClass: "droppable-area-active",
			hoverClass: "droppable-area-hover",
			drop: function(event, ui) {
				var field_name = ui.draggable.text().trim();
				obj.add_field_to_chart_sort_fields(field_name);
			},
		});		
		// this.set('drop_event_attached', true);
	},

	add_field_to_chart_dimensions: function(field_name,display_name,format_as,sort_order,id,rank) {
		var chartDimensionsContainer = this.get('chartDimensionsContainerView');
		chartDimensionsContainer.addChildView(field_name,display_name,format_as,sort_order,id,rank);
	},

	add_field_to_chart_rows: function(field_name,display_name,format_as,sort_order,id,rank) {
		var chartRowsContainer = this.get('chartRowsContainerView');
		chartRowsContainer.addChildView(field_name,display_name,format_as,sort_order,id,rank);
	},

	add_field_to_chart_columns: function(field_name,display_name,format_as,sort_order,id,rank) {
		var chartColumnsContainer = this.get('chartColumnsContainerView');
		chartColumnsContainer.addChildView(field_name,display_name,format_as,sort_order,id,rank);
	},

	add_field_to_chart_measures: function(field_name,display_name,format_as,sort_order,id, is_calculated,prefix,suffix) {
		var chartMeasuresContainer = this.get('chartMeasuresContainerView');
		chartMeasuresContainer.addChildView(field_name,display_name,format_as,sort_order,id,is_calculated,prefix,suffix);
	},

	add_field_to_chart_sort_fields: function(field_name) {
		var chartSortFieldsContainer = this.get('chartSortFieldsContainerView');
		chartSortFieldsContainer.addChildView(field_name);
	},

	getPreviewData: function(target_val) {
		var obj = this;	
		var chart_type = obj.get('chartType') || this.$().find(".active").val();
		var notice_elem = $("#new-preview-notice")
		notice_elem.html("");
		notice_elem.removeClass('alert alert-error');

		if(chart_type == null) {			
			notice_elem.html('Please select a chart type.');
			notice_elem.addClass('alert alert-error');
			notice_elem.fadeIn().delay(10000).fadeOut();
			return;
		}

		if(chart_type == 'grouped_table'){
			var dimesions_obj = obj.buildRowsAndColumns();
		}else{
			var dimesions_obj = obj.buildDimensions();
		}		
		var measures_obj = obj.buildmeasures();
		var limit = obj.get('count');


		var msg=this.checkChartConfigs(chart_type, dimesions_obj, measures_obj);
		if(msg){			
			notice_elem.html(msg);
			notice_elem.addClass('alert alert-error');
			notice_elem.fadeIn().delay(10000).fadeOut();
			return;
		}

		var data_source_id = this.get('dataSourceId');
        chart_type = getChartNumber(chart_type).toString();

		if(target_val == "generate_preview"){
			if( obj.$().find('#display_option').find('.active').val() == "chart_data"){
				obj.chartDataTable(chart_type, dimesions_obj, measures_obj, data_source_id, limit);
			}else{
				obj.generateDummyObject(chart_type, dimesions_obj, measures_obj, data_source_id, limit);
			}			
		}else{
			if(target_val == "chart_data"){
				obj.chartDataTable(chart_type, dimesions_obj, measures_obj, data_source_id, limit);
			}else{
				obj.generateDummyObject(chart_type, dimesions_obj, measures_obj, data_source_id, limit);
			}			
		}
	},	

	buildDimensions: function(){
		var obj = this;
		var childView = obj.chartDimensionsContainerView._childViews;
		obj_array = [];
		for(var i=1; i<childView.length; i++){
			obj_array.push({field_name: childView[i].get('field_name'), 
				      		format_as: childView[i].get('format_as'), 
				      		display_name: childView[i].get('field_display'),
				      		sort_order: childView[i].get('sort_order'),
				      		rank: childView[i].get('rank')});
				      	
		}
		return obj_array;			
	},

	buildmeasures: function(){
		var obj = this;
		var childView = obj.chartMeasuresContainerView._childViews;
		obj_array = [];
		for(var i=1; i<childView.length; i++){
			obj_array.push({field_name: childView[i].get('field_name'), 
							format_as: childView[i].get('format_as'), 
							display_name: childView[i].get('field_display'), 
							sort_order: childView[i].get('sort_order'),
							is_calculated: childView[i].get('is_calculated'),
							prefix: childView[i].get('prefix'),
							suffix:  childView[i].get('suffix')});
		}	
		return obj_array;	
	},

	buildRowsAndColumns: function(){
		var obj = this;
		var columnChildView = obj.chartColumnsContainerView._childViews;
		var rowChildView = obj.chartRowsContainerView._childViews;
		obj_array = [];
		for(var j=1; j<rowChildView.length; j++){
			obj_array.push({field_name: rowChildView[j].get('field_name'), format_as: rowChildView[j].get('format_as'), display_name: rowChildView[j].get('field_display'), sort_order: rowChildView[j].get('sort_order'), is_row: rowChildView[j].get('is_row')});
		}			
		for(var i=1; i<columnChildView.length; i++){
			obj_array.push({field_name: columnChildView[i].get('field_name'), format_as: columnChildView[i].get('format_as'), display_name: columnChildView[i].get('field_display'), sort_order: columnChildView[i].get('sort_order'), is_row: columnChildView[i].get('is_row')});
		}			
		return obj_array;	
	},	

	chartDataTable: function(chart_type, dimesions_obj, measures_obj, data_source_id, limit){
		var obj = this;
		var auth_token = Cibi.Auth.get('authToken');
		var url_str = '/charts/'+ data_source_id +'/getPreviewData?auth_token=' + auth_token;

		url_str = url_str + "&chart_type=" + chart_type;	
		url_str = url_str + "&dimensions_obj=" + encodeURIComponent(JSON.stringify(dimesions_obj));
		url_str = url_str + "&measures_obj=" + encodeURIComponent(JSON.stringify(measures_obj));
		if(limit){
			url_str = url_str + "&limit=" + limit;
		}
		
	
        $.ajax({
            url: url_str,
            type: 'get',
            async: true,
            success: function(result) {
                data = result['charts']; 
                html = obj.showTableData(data, dimesions_obj, measures_obj) 
                $('#chart-null').html(html);
            }
        });
    },

    destroyDummyObject: function() {
		var obj = this;		
		if(obj.get('chart_obj')){
			obj.get('chart_obj').destroy();
			obj.get('cds_obj').destroy();
			obj.get('dashboard_obj').destroy();			
			obj.get('dim_obj').forEach(function(m){
				m.destroy();
			});
			obj.get('fact_obj').forEach(function(m){
				m.destroy();
			});						

		}		
    },

    removeDummyObjectsFromTransaction: function(transaction) {
		var obj = this;		
		if(obj.get('chart_obj')){
			transaction.removeRecord(this.get('chart_obj'));
			transaction.removeRecord(obj.get('cds_obj'));			
			transaction.removeRecord(obj.get('dashboard_obj'));			
			obj.get('dim_obj').forEach(function(m){
				transaction.removeRecord(m);			
			});
			obj.get('fact_obj').forEach(function(m){
				transaction.removeRecord(m);			
			});						
		}		
    },    

	generateDummyObject: function(chart_type, dimesions_obj, measures_obj, data_source_id, limit){
		var obj = this;		
		obj.destroyDummyObject();
		if(chart_type == '14'){
			var configs = {};
			var rows = [];
			var columns = [];
			var measures_array = [];
			dimesions_obj.forEach(function(d){
				if(d.is_row == true){
					rows.push(d.display_name);
				}else{
					columns.push(d.display_name);
				}
			});
			measures_obj.forEach(function(m){
				fact = {fieldName: m['field_name'], 
						formatAs: m['format_as'], 
						displayName: m['display_name'], 
						sortOrder: m['sort_order'],
						isCalculated: m['is_calculated'],
						prefix: m['prefix'],
						suffix: m['suffix']};
				measures_array.push(fact);
			});
			configs["hierarchy"] = rows;
			configs["column_fields"] = columns;
			configs["measure_fields"] = measures_array;
			configs = JSON.stringify(configs);
		}	
		var dashboard = Cibi.Dashboard.createRecord();
		var chart = Cibi.Chart.createRecord({chartType: chart_type, 
											 preview: true,
											 preview_data: {dimensions: dimesions_obj, measures: measures_obj, count: limit},	
											 data_source_id: data_source_id,
											 width: 400,
											 height: 300,
											 marginTop: 40,
											 marginRight: 40,
											 marginBottom: 40,
											 marginLeft: 40,
											 configs: configs	
											});
		dashboard.get('charts').pushObject(chart);		
		var cds =  Cibi.ChartsDataSource.createRecord();
		var data_source = Cibi.DataSource.find(data_source_id);
		data_source.get('chartsDataSources').pushObject(cds);
		chart.get('chartsDataSources').pushObject(cds);
		dim_obj = [];
		dimesions_obj.forEach(function(d){	
			dimesions = Cibi.Dimension.createRecord({fieldName: d['field_name'], formatAs: d['format_as'], displayName: d['display_name'], sortOrder: d['sort_order']})
			dim_obj.push(dimesions);
			chart.get('dimensions').pushObject(dimesions);	
		});	
		fact_obj = [];
		measures_obj.forEach(function(m){
			measures = Cibi.Measure.createRecord({fieldName: m['field_name'], formatAs: m['format_as'], displayName: m['display_name'], sortOrder: m['sort_order'], isCalculated: m['is_calculated'], prefix: m['prefix'], suffix: m['suffix']});
			fact_obj.push(measures);
			chart.get('measures').pushObject(measures);	
		});
		configObj = {element: 'chart-null', chart: chart, cds: [cds], hierarchy: rows, column_fields: columns, measure_fields: measures_array	 }
		chart.set('configObj', configObj)
		obj.set('chart_obj', chart);
		obj.set('cds_obj', cds);
		obj.set('dim_obj', dim_obj);
		obj.set('fact_obj', fact_obj);
		obj.set('dashboard_obj', dashboard);
		chart.drawPreviewChart(chart_type);
	},

	showTableData: function(data, dimensions_obj, measures_obj) {
    	var obj=this; 
		
    	var html="<div class='table-body' style='padding: 0px;'>";		
		html += '<table class="table table-bordered">';
			    	  
	    data = (obj.get('chartType') == 'table' || this.$().find(".active").val() == 'table') ? data[0]["results"] : data;
	    html += "<tr>";
    	dimensions_obj.forEach(function(d){
    		html += "<th>"+ d['display_name'] + "</th>"
    	});	
    	measures_obj.forEach(function(m){
    		html += "<th>"+ m['display_name'] + "</th>"
    	});	    	    
	    html += "</tr>";

	    for(var j = 0; j < data.length; j++) {
	        var dat = data[j];
		    html +="<tr>";
	    	dimensions_obj.forEach(function(d){
	    			html += "<td>"+ dat[d['display_name']] + "</td>"   		
	    	});		    
	    	measures_obj.forEach(function(m){
	    			html += "<td>"+ dat[m['display_name']] + "</td>"
	    	});
	        html += "</tr>";
	    }
		html += '</table>';	
		return html;
	},



	chartTypeView: Ember.View.extend({
		template: Ember.Handlebars.compile("{{partial 'dashboard/edit_chart/chartType'}}"),
		didInsertElement: function() {
			$("button").tooltip({
				placement: "bottom"
			});
		},

		click: function(e) {
			var elem = e.target;
			if(elem.nodeName.toLowerCase() === 'button') {
				this._parentView.set('chartType', elem.value);
			} else if ( elem.nodeName.toLowerCase() === "img") {
				this._parentView.set('chartType', elem.parentElement.value);
			}
		},
	}),

	chartRowsView: Ember.ContainerView.extend({
		viewName:'chartRowsContainerView',
		childViews: ['draggableArea'],
		tagName: 'ul',
		classNames: ['inline', 'field_area'],

		didInsertElement: function(){
			var obj = this;
			obj.get('controller').get('content').get('dimensions').forEach(function(d){
				if(d.get('isRow') == true){
					obj._parentView._parentView._parentView.add_field_to_chart_rows(d.get('fieldName'),d.get('displayName'),d.get('formatAs'),d.get('sortOrder'),d.get('id'));
				}				
			});

			$("#" + this.elementId).sortable({ items: "li:not(.droppable-area)",
				placeholder: "sortable_placeholder",
				forcePlaceholderSize:true
			});
			
			$("#" + this.elementId).on("sortstop",function(event,ui){
				var child_views = obj._childViews;
				
				var list_items = $(event.target).find("li");
				for(var i=1;i<list_items.length;i++){
					var id = $(list_items[i]).attr("id");
					var rank =$(list_items[i]).index();
					var childview=_.filter(child_views, function(c){
						return c.elementId == id;
					});
					childview.objectAt(0).set("rank",rank);
				}
			});
			$("#" + this.elementId).disableSelection();				
		}, 		

		destroy: function() {
			var obj = this,
			chart_rows_views = obj.get('childViews');
			chart_rows_views.forEach(function(d) {
				obj.removeObject(d);
			});		

			this._super();
		},

		draggableArea:Em.View.create({
			template: Ember.Handlebars.compile("Drag Row Fields Here"),
			tagName: "li",
			classNames: ['droppable-area', 'row'],
		}),

		addChildView: function(field_name,display_name,format_as,sort_order,id,rank){
			var new_chart_view=this._parentView._parentView._parentView,
			current_rows = this.chartRowsArr();
			var rank = current_rows.length+1;
			var display_name = display_name ? display_name : field_name;
			// if(current_rows.indexOf(field_name) == -1) {
				// Merge Change: TODO: Remove later
// 				this.pushObject(new_chart_view.chartDimensionView.create({field_name: field_name, field_display: display_name, is_row: true, field_id: id,rank:rank}));
			this.pushObject(new_chart_view.chartDimensionView.create({field_name: field_name, format_as: format_as, field_display: display_name,sort_order: sort_order, is_row: true, field_id: id, rank:rank}));
			var columnViews = new_chart_view.chartColumnsContainerView._childViews;
			for(var i=1;i < columnViews.length; i++){
				columnViews[i].rank=columnViews[i].rank+1;
			}
			// } else {
			// 	new_chart_view.set('row_error_message', field_name + " already exists!");
			// 	setTimeout(function() {
			// 		new_chart_view.set('row_error_message', false);
			// 	}, 3000);
			// }	
		},

		chartRowsArr: function() {
			var chart_rows_views = this.get('childViews'),
			rows = [];

			chart_rows_views.forEach(function(d) {
				if(d.get('field_name')) {
					rows.push(d.get('field_name'));
				}			
			});		
			return rows;
		},

		clear_all_rows: function() {
			var obj = this,
			chart_rows_views = this.get('childViews');
			chart_rows_views.forEach(function(d) {
				if(d.get('field_name')) {
					obj.removeObject(d);
				}			
			});		
		},
	}),

	chartColumnsView: Ember.ContainerView.extend({
		viewName:'chartColumnsContainerView',
		childViews: ['draggableArea'],
		tagName: 'ul',
		classNames: ['inline', 'field_area'],

		didInsertElement: function(){
			var obj = this;
			obj.get('controller').get('content').get('dimensions').forEach(function(d){
				if(d.get('isRow') == false){
					obj._parentView._parentView._parentView.add_field_to_chart_columns(d.get('fieldName'),d.get('displayName'),d.get('formatAs'),d.get('sortOrder'),d.get('id'));
				}
			});

			$("#" + this.elementId).sortable({ items: "li:not(.droppable-area)",
				placeholder: "sortable_placeholder",
				forcePlaceholderSize:true
			});
			var new_chart_view=this._parentView._parentView._parentView;
			var current_rows = new_chart_view.chartRowsContainerView._childViews.length-1;
			$("#" + this.elementId).on("sortstop",function(event,ui){
				var child_views = obj._childViews;
				
				var list_items = $(event.target).find("li");
				for(var i=1;i<list_items.length;i++){
					var id = $(list_items[i]).attr("id");
					var rank =$(list_items[i]).index()+current_rows;
					var childview=_.filter(child_views, function(c){
						return c.elementId == id;
					});
					childview.objectAt(0).set("rank",rank);
				}
			});
			$("#" + this.elementId).disableSelection();				
		}, 

		destroy: function() {
			var obj = this,
			chart_columns_views = obj.get('childViews');
			chart_columns_views.forEach(function(d) {
				obj.removeObject(d);
			});		

			this._super();
		},

		draggableArea:Em.View.create({
			template: Ember.Handlebars.compile("Drag Column Fields Here"),
			tagName: "li",
			classNames: ['droppable-area', 'column'],
		}),

		addChildView: function(field_name,display_name,format_as,sort_order,id,rank){
			var new_chart_view=this._parentView._parentView._parentView,
			current_columns = this.chartColumnsArr();
			current_rows = new_chart_view.chartRowsContainerView._childViews.length-1;
			rank =current_rows + current_columns.length + 1;
			var display_name = display_name ? display_name : field_name;
			// if(current_columns.indexOf(field_name) == -1) {
// 				Merge Change: TODO: Remove later
// 				this.pushObject(new_chart_view.chartDimensionView.create({field_name: field_name, field_display: display_name, is_row: false, field_id: id,rank:rank}));
				this.pushObject(new_chart_view.chartDimensionView.create({field_name: field_name, format_as: format_as, field_display: display_name, sort_order: sort_order, is_row: false, field_id: id, rank:rank}));
			// } else {
			// 	new_chart_view.set('column_error_message', field_name + " already exists!");
			// 	setTimeout(function() {
			// 		new_chart_view.set('column_error_message', false);
			// 	}, 3000);
			// }	
		},

		chartColumnsArr: function() {
			var chart_columns_views = this.get('childViews'),
			columns = [];
			chart_columns_views.forEach(function(d) {
				if(d.get('field_name')) {
					columns.push(d.get('field_name'));
				}			
			});		
			return columns;
		},

		clear_all_columns: function() {
			var obj = this,
			chart_columns_views = this.get('childViews');
			chart_columns_views.forEach(function(d) {
				if(d.get('field_name')) {
					obj.removeObject(d);
				}			
			});		
		},
	}),

	chartDimensionsView: Ember.ContainerView.extend({
		viewName: 'chartDimensionsContainerView',
		childViews: ['draggableArea'],
		tagName: 'ul',
		classNames: ['inline', 'field_area','sortable_placeholder'],

		destroy: function() {
			var obj = this,
			chart_dimensions_views = obj.get('childViews');
			chart_dimensions_views.forEach(function(d) {
				obj.removeObject(d);
			});		

			this._super();
		},

		draggableArea: Em.View.create({
			template: Ember.Handlebars.compile("Drag Fields Here"),
			tagName: "li",
			classNames: ['droppable-area', 'dimension'],
		}),	

		didInsertElement: function(){
			var obj = this;
			obj.get('controller').get('content').get('dimensions').forEach(function(d){
				obj._parentView._parentView._parentView.add_field_to_chart_dimensions(d.get('fieldName'),d.get('displayName'),d.get('formatAs'),d.get('sortOrder'),d.get('id'));				
			});			 
			$("#" + this.elementId).sortable({ items: "li:not(.droppable-area)",
				placeholder: "sortable_placeholder",
				forcePlaceholderSize:true
			});
			
			$("#" + this.elementId).on("sortstop",function(event,ui){
				var child_views = obj._childViews;
				
				var list_items = $(event.target).find("li");
				for(var i=1;i<list_items.length;i++){
					var id = $(list_items[i]).attr("id");
					var rank =$(list_items[i]).index();
					var childview=_.filter(child_views, function(c){
						return c.elementId == id;
					});
					childview.objectAt(0).set("rank",rank);
				}
			});
			$("#" + this.elementId).disableSelection();				
		}, 

		addChildView: function(field_name,display_name,format_as,sort_order,id,rank) {
			var new_chart_view = this._parentView._parentView._parentView,
			current_dimensions = this.chartDimensionsArr();
			var rank = current_dimensions.length+1;	
			var display_name = display_name ? display_name : field_name			
			// if(current_dimensions.indexOf(field_name) == -1) {
				this.pushObject(new_chart_view.chartDimensionView.create({field_name: field_name, field_display: display_name, format_as: format_as, sort_order: sort_order, field_id: id,rank:rank}));
			// } else {
			// 	new_chart_view.set('dimension_error_message', "Dimension for " + field_name + " already exists!");
			// 	setTimeout(function() {
			// 		new_chart_view.set('dimension_error_message', false);
			// 	}, 3000);
			// }
		},

		chartDimensionsArr: function() {
			var chart_dimensions_views = this.get('childViews'),
			dimensions = [];

			chart_dimensions_views.forEach(function(d) {
				if(d.get('field_name')) {
					dimensions.push(d.get('field_name'));
				}			
			});		
			return dimensions;
		},

		clear_all_dimensions: function() {
			var obj = this,
			chart_dimensions_views = this.get('childViews');
			chart_dimensions_views.forEach(function(d) {
				if(d.get('field_name') != undefined) {
					obj.removeObject(d);
				}			
			});		
		},

	}),



	chartMeasuresView: Ember.ContainerView.extend({
		viewName: 'chartMeasuresContainerView',
		childViews: ['draggableArea'],
		tagName: 'ul',
		classNames: ['inline', 'field_area'],

		draggableArea: Em.View.create({
			template: Ember.Handlebars.compile("Drag Fields Here"),
			tagName: "li",
			classNames: ['droppable-area', 'measure'],
		}),


		didInsertElement: function(){
			var obj = this;			
			obj.get('controller').get('content').get('measures').forEach(function(m){
				obj._parentView._parentView.add_field_to_chart_measures(m.get('fieldName'),m.get('displayName'),m.get('formatAs'),m.get('sortOrder'),m.get('id'),m.get('isCalculated'),m.get('prefix'),m.get('suffix'));
			});			
		},

		destroy: function() {
			var obj = this,
			chart_measures_views = obj.get('childViews');
			chart_measures_views.forEach(function(d) {
				obj.removeObject(d);
			});		

			this._super();
		},

		addChildView: function(field_name,display_name,format_as,sort_order,id,is_calculated,prefix,suffix) {
			var new_chart_view = this._parentView._parentView,
			current_measures = this.chartMeasuresArr();	
			var display_name = display_name ? display_name : field_name		
			// if(current_measures.indexOf(field_name) == -1) {
				this.pushObject(new_chart_view.chartMeasureView.create({field_name: field_name, field_display: display_name, format_as: format_as, sort_order: sort_order, field_id: id, is_calculated: is_calculated, prefix: prefix, suffix: suffix}));
			// } else {
			// 	new_chart_view.set('measure_error_message', "Measure for " + field_name + " already exists!");
			// 	setTimeout(function() {
			// 		new_chart_view.set('measure_error_message', false);
			// 	}, 3000);
			// }
		},

		chartMeasuresArr: function() {
			var chart_measures_views = this.get('childViews'),
			measures = [];

			chart_measures_views.forEach(function(d) {
				if(d.get('field_name')) {
					measures.push(d.get('field_name'));
				}			
			});		
			return measures;
		},

		clear_all_measures: function() {
			var obj = this,
			chart_measure_views = this.get('childViews');
			chart_measure_views.forEach(function(d) {
				if(d.get('field_name')) {
					obj.removeObject(d);
				}			
			});		
		},

	}),

	chartMeasureView: Ember.View.extend({
		template: Ember.Handlebars.compile("{{partial 'dashboard/edit_chart/chart_measure'}}"),
		field_name: "",
		format_as: "",
		field_display: "",
		tagName: 'li',
		sort_order: "",
		classNames: ['dragged-field'],

		didInsertElement: function(){
			var obj=this;
			obj.set('isCalculated', true);
		},

		click: function(event){
			var obj=this;
			if($(event.target).attr("class") == 'ember-view dragged-field' || $(event.target).attr("class") == 'dropdown' || $(event.target).attr("class") == 'dropdown-toggle'){				
				if(obj.is_calculated){
					obj.set('isCalculated', true);
					obj.$().find('.is_calculated').prop('checked', true);
					obj.$().find('.field_name').val(obj.field_name);
				}else{
					obj.set('isCalculated', false);
				}				
				obj.$().find('.field_display').val(obj.field_display);
				obj.$().find('.fieldName').val(obj.field_name);
				obj.$().find('.dropdown-menu').css('left','50%');
				obj.$().find('.dropdown-menu').css('margin-left','-185px');
				obj.$().find('.sort_order').val(obj.sort_order);
				obj.$().find('.prefix').val(obj.prefix);
				obj.$().find('.suffix').val(obj.suffix);
			}	
		},

		toDisplayFieldName: function(){
			var obj=this;
			if(obj.get('is_calculated') == true){
				return false;
			}else{
				return true;
			}
		}.property('is_calculated'),

		field_display_format: function(){
			var obj = this;
			var field_name = this.get('field_name');
			var measures = this.get('controller').get('content').get('measures');
			var format = '';
			measures.forEach(function(m){
				if(m.get('fieldName') == field_name){
					format = m.get('formatAs');
				}
			});
			return format;	
		}.property(''),	

		displayNameObserver: function(){
			var obj = this;
			if(obj.$() != undefined){
				if(obj.$().find('.is_calculated').prop('checked')){
					obj.$().find('.field_display').val('');
				}else{
					obj.$().find('.field_display').val(obj.get('field_name'));
					obj.$().find('.fieldName').val(obj.get('field_name'));
				}
			}
		}.observes('isCalculated'),

		setFieldDisplay: function(){
			var obj=this;
			var facts=obj.get('fact_formats');
			var selected_fact=_.filter(facts,function(f){
				if(f["key"]==obj.get('field_display_format'))
					return true;
			});
			var display_field;
			if(selected_fact.objectAt(0).display!=undefined){
				display_field=selected_fact.objectAt(0).display + obj.get('field_name');
			}
			else{
				display_field=obj.get('field_name');
			}
			obj.$().find('.field_display').val(display_field);				
		}.observes('field_display_format', 'field_name'),

		removeFromList: function() {
			var parent = this._parentView;
			var parentObj = parent._parentView._parentView;
			var deleted_measures = parentObj.get('deleted_measures') || []
			deleted_measures.push(this.get('field_id'));
			parentObj.set('deleted_measures', deleted_measures);
			parent.removeObject(this);
		},

		fact_formats: function() {
			return [
				{ name: '', key: ''},
				{ name: 'Sum of Fact', key: 'sum', display: 'Sum of '},
				{ name: 'Avg of Fact', key: 'avg', display: 'Avg of '},
				{ name: 'Count of Fact', key: 'count', display: 'Count of '},
				{ name: 'Count Unique of Fact', key:'count,distinct', display: 'Count Unique of '},
				{ name: 'Count Nulls of Fact', key: 'noops', display: 'Count Nulls of '},
				{ name: '% Valid Entries of Total Count', key: 'opspc', display: '% Valid Entries of Total Count of '},				
				{ name: '% Missing Entries of Total Count', key: 'noopspc', display: '% Missing Entries of Total Count of '}, 
				{ name: 'Min', key: 'min', display: 'Min of '},
				{ name: 'Max', key: 'max', display: 'Max of '},
				{ name: 'Standard Deviation (Sample)', key: 'stddev_samp', display: 'StdDev(Sample) of '},
				{ name: 'Standard Deviation (Population)', key: 'stddev_pop', display: 'StdDev(Population) of '},
				{ name: 'Variance (Sample)', key: 'var_samp', display: 'Variance(Sample) of '},
				{ name: 'Variance (Population)', key: 'var_pop', display: 'Variance(Population) of '},
			];
		}.property(''),

		save_changes: function() {		
			var obj = this;
			var field_display=obj.$().find('.field_display').val();
			if(field_display.trim().length>0){				
				obj.set('sort_order', obj.$().find('.sort_order').val());
				obj.set('format_as', obj.$().find('.format_as').val());
				obj.set('is_calculated', obj.$().find('.is_calculated').prop('checked'));
				if(obj.get('is_calculated')){
					obj.set('field_name', obj.$().find('.field_name').val());
				}
				obj.set('field_display', field_display);
				obj.set('prefix', obj.$().find('.prefix').val());
				obj.set('suffix', obj.$().find('.suffix').val());				
				this.$().find('.dropdown').toggleClass('open');
				obj.set('error_msg',null);
			}
			else{
				obj.set('error_msg','Please specify field display');
			}

		},

		cancel_changes: function() {
			var obj = this;			
			var calc = obj.get('is_calculated');
			obj.$().find('.is_calculated').prop('checked', calc);
			obj.set('isCalculated', calc);
			obj.$().find('.field_display').val(obj.get('field_display'));
			obj.$().find('.sort_order').val(obj.get('sort_order'));
			obj.$().find('.format_as').val(obj.get('format_as'));
			this.$().find('.dropdown').toggleClass('open');
			obj.set('error_msg',null);
		},

	}),	

	chartDimensionView: Ember.View.extend({
		template: Ember.Handlebars.compile("{{partial 'dashboard/edit_chart/chart_dimension'}}"),
		field_name: "",
		format_as: "",
		field_display: "",
		sort_order: "",
		is_row: "",
		rank: "",
		tagName: 'li',
		classNames: ['dragged-field'],		

		didInsertElement: function() {
			var el = $("#" + this.elementId);
			if(el.length > 0) {
				$("#" + this._parentView.elementId).sortable("refresh");
			}
		},

		click: function(event){
			var obj=this;
				if($(event.target).attr("class") == 'ember-view dragged-field' || $(event.target).attr("class") == 'dropdown' || $(event.target).attr("class") == 'dropdown-toggle'){
					obj.$().find('.field_display').val(obj.field_display);
					obj.$().find('.sort_order').val(obj.sort_order);
					obj.$().find('.fieldName').val(obj.field_name);
					obj.$().find('.dropdown-menu').css('left','50%');
					obj.$().find('.dropdown-menu').css('margin-left','-185px');
				}
		},

		field_display_format: function(){
			var obj = this;
			var field_name = this.get('field_name');
			var dimensions = this.get('controller').get('content').get('dimensions');
			var format = '';
			dimensions.forEach(function(m){
				if(m.get('fieldName') == field_name){
					format = m.get('formatAs');
				}
			});
			return format;	
		}.property(''),			

		setFieldDisplay: function(){
			var obj=this;
			var formats=obj.get('supportedFormats');
			var selected_fact=_.filter(formats,function(f){
				if(f["key"]==obj.get('field_display_format'))
					return true;
			});
			var display_field;
			if(selected_fact.objectAt(0).display!=undefined){
				display_field=selected_fact.objectAt(0).display + obj.get('field_name');
			}
			else{
				display_field=obj.get('field_name');
			}
			obj.$().find('.field_display').val(display_field);	

		}.observes('field_display_format'),

		removeFromList: function() {
			var parent = this._parentView;
			var parentObj = parent._parentView._parentView._parentView;
			var deleted_dimensions = parentObj.get('deleted_dimensions') || []
			deleted_dimensions.push(this.get('field_id'));
			parentObj.set('deleted_dimensions', deleted_dimensions);
			parent.removeObject(this);
		},

		date_type: function() {
			var dimension=this.get('field_name');	
			if(dimension){				
				var datasourceId = this.get('parentView').get('parentView').get('dataSourceId');
				var ds=Cibi.DataSource.find(datasourceId);
				var dataType=ds.getDataType(dimension);	
				if(dataType=="date" || dataType =="datetime"){
					return true;			
				}else{
					return false;
				}
			}else{
				return false;
			}
		}.property('field_name'),

		supportedFormats: function(){		
			var dimension=this.get('field_name');	
			var datasourceId = this.get('parentView').get('parentView').get('dataSourceId');
			var ds=Cibi.DataSource.find(datasourceId);
			var dataType=ds.getDataType(dimension);	
			if(dataType=="date" || dataType =="datetime"){
				var formats = [
					{ key: ''},
					{ key: 'Month', display: 'Month of '},
					{ key: 'Quarter', display: 'Quarter of '},
					{ key: 'Year', display: 'Year of '},
					{ key: 'Month Year', display: 'Month Year of '},
					{ key: 'Day', display: 'Day of '},
					{ key: 'Week', display: 'Week of '}
				];

				if(dataType == "datetime"){
					formats.push({key: 'Hours', display: 'Hours of '}),
					formats.push({key: 'Date' , display: 'Date of '})
				}
				return formats;
			}else{
				return [];
			}			
		}.property('field_name'),

		save_changes: function() {		
			var obj = this;
			var field_display=obj.$().find('.field_display').val();
			if(field_display.trim().length>0){
				obj.set('field_display', field_display);
				obj.set('sort_order', obj.$().find('.sort_order').val());
				obj.set('format_as', obj.$().find('.format_as').val());				
				this.$().find('.dropdown').toggleClass('open');
				obj.set('error_msg',null);
			}
			else{
				obj.set('error_msg','Please specify field display');
			}			
		},

		cancel_changes: function() {
			var obj = this;
			obj.$().find('.field_display').val(obj.get('field_display'));
			obj.$().find('.sort_order').val(obj.get('sort_order'));
			obj.$().find('.format_as').val(obj.get('format_as'));
			obj.$().find('.sort_order').val(obj.get('sort_order'));			
			this.$().find('.dropdown').toggleClass('open');
			obj.set('error_msg',null);
		},		
	}),
});