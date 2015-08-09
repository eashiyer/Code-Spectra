Cibi.PivotTableChart = Em.Object.extend({
	init: function() {
		this.set("root", {});
	},

    draw: function() {
        var obj = this;
        var charts_data_sources = obj.chart.get('chartsDataSources');
        var cds = charts_data_sources.objectAt(0);
        var filters = obj.chart.getFilters();
        obj.set('cds_properties', cds.getProperties(["depth", "fact", "dimensionName", "dimensionFormatAs", "factFormat"]));
        obj.chart.set('dataLoading', true);
        // calculate limit and offset from configs and pass to the chart data method as 4th and 5th parameter
        var limit=JSON.parse(obj.chart.get('configs'))["limit"];
        if(!obj.chart.get('offset'))
        {
        	obj.chart.set('offset',0);
        }
        var offset=parseInt(limit) * parseInt(obj.chart.get('offset'));
        var data = cds.chartData(obj._drawPivotTable, obj, filters, limit, offset);
        // obj.chart.set("isSetup", false);
    },

    hierarchy_exists: function() {
    	return this.hierarchy && this.hierarchy.length > 0;
    },
    
    measures_exist: function() {
    	return this.measure_fields && this.measure_fields.length > 0;
    },

    column_fields_exist: function() {
    	return this.column_fields && this.column_fields.length > 0;
    },

    _drawPivotTable: function(data, obj){
    	var drawWithHeatmap = JSON.parse(obj.chart.get('configs'))["draw_with_heatmap"];
    	var charts_data_sources = obj.chart.get('chartsDataSources');
    	var cds = charts_data_sources.objectAt(0);
    	var margin =  {
                top: obj.chart.get('marginTop'), 
                right: obj.chart.get('marginRight'), 
                bottom: obj.chart.get('marginBottom'),  
                left: obj.chart.get('marginLeft'), 
              }
    	// if(!obj.hierarchy || !(obj.hierarchy.length>0 && obj.measure_fields.length>0)){
		if(!obj.hierarchy_exists() && !obj.measures_exist()){    		
			if(!(obj.hierarchy_exists() || obj.column_fields_exist() || obj.measures_exist())){
				$("#"+obj.element).html("<span>To build this report, click on the <a>Configure Report</a> link and select the rows and measures.</span>");
				$("#"+obj.element).find("a").on("click",function(e){
			    	$("#"+obj.chart.get('containerId')).find("#modal-pivot-configs").modal();
			    	$("#"+obj.chart.get('containerId')).find("#modal-pivot-configs").find(".draggableElement").draggable({
						appendTo: $("#"+obj.chart.get('containerId')).find("#modal-pivot-configs"),
			      		helper: "clone",
			      		revert: "invalid"
					});
					$("#"+obj.chart.get('containerId')).find("#modal-pivot-configs").find(".droppableElement ul").droppable({
						drop: function( event, ui ) {
			        		$( this ).find( ".placeholder" ).remove();        		
			        		if(!(ui.draggable.parent().attr('id')==this.id)){
			        			var configObj = JSON.parse((obj.chart.get('configs')) ? obj.chart.get('configs') : '{}');
			        			var draggedLabel=ui.draggable.find("label").text();
			        			if(ui.draggable.parent().attr('id')=="row_fields"){
			        				draggedLabel=ui.draggable.find("label").text();
				        			configObj["hierarchy"]=_.without(configObj["hierarchy"], draggedLabel);
				        		}
				        		else if(ui.draggable.parent().attr('id')=="column_fields"){
				        			draggedLabel=ui.draggable.find("label").text();
				        			configObj["column_fields"]=_.without(configObj["column_fields"], draggedLabel);
				        		}
				        		else if(ui.draggable.parent().attr('id')=="measure_fields"){
				        			var text=ui.draggable.find("select").val();
				        			draggedLabel=text.split("(")[1].replace(")","");
				        			var m=_.find(configObj["measure_fields"],function(m){
										return ((m.format+"("+m.field+")")==text);
									});
				        			configObj["measure_fields"]=_.without(configObj["measure_fields"], m);
				        		}  
				        		if(this.id=="row_fields"){
				        			if(!configObj["hierarchy"]){
				        				configObj["hierarchy"]=[];
				        			}
				        			configObj["hierarchy"].push(draggedLabel);
				        		}
				        		else if(this.id=="column_fields"){
				        			if(!configObj["column_fields"]){
				        				configObj["column_fields"]=[];
				        			}
				        			configObj["column_fields"].push(draggedLabel);
				        		}
				        		else if(this.id=="measure_fields"){
				        			var measure={};
				        			measure["field"]=draggedLabel;
				        			measure["format"]="Sum";
				        			if(!configObj["measure_fields"]){
				        				configObj["measure_fields"]=[];
				        			}
				        			configObj["measure_fields"].push(measure);
				        		}	        		      		
				        		obj.chart.set('configs', JSON.stringify(configObj));
			        		}        		
			      		}
			      	}).sortable({
				      revert: true
				    });
				});
			}
			else if(!(obj.hierarchy_exists() || obj.measures_exist())){
				$("#"+obj.element).html("<div class='alert alert-info'>Please specify rows and measures</div>");
			}
			else if(!obj.hierarchy_exists()){
				$("#"+obj.element).html("<div class='alert alert-info'>Please specify rows</div>");
			}
			else if(!obj.measures_exist())
			{
				$("#"+obj.element).html("<div class='alert alert-info'>Please specify measures</div>");
			}
		}
		else{
			obj.chart.clearChart();	
			var limit=JSON.parse(obj.chart.get('configs'))["limit"];
			var html="<div style='margin-left:"+margin.left+"px; margin-right:"+margin.right+"px; margin-top:"+margin.top+"px; margin-bottom:"+margin.bottom+"px;'>";
			html+="<div id='pivot-table-" + obj.element + "'></div>";
			if(limit && (parseInt(limit) > 0)){
				html+="<div class='pagination pagination-centered' style='margin-bottom:0px; margin-top:4px;'>";
				html+="<ul>";
				// html+="<li><a>&laquo;</a></li>";
				html+="<li><a id='prev_link'>prev</a></li>";
				html+="<li class='active'>";
				html+="<a>"+obj.chart.get('current_page')+"</a>";
				html+="</li>";
				html+="<li><a id='next_link'>next</a></li>";
				// html+="<li><a>&raquo;</a></li>";
				html+="</ul>";
				html+="</div>";	
			}			
			html+="</div>";
			$("#" + obj.element).html(html);
			$("#" + obj.element).find("#prev_link").on('click', function() {
				var chart = obj.chart;
				var offset = obj.chart.get('offset');
				if(parseInt(offset) == 0){
					return;
				}
				else{
					offset=offset-1;
					chart.set('offset', offset);
					chart.draw();
				}
			});
			$("#" + obj.element).find("#next_link").on('click', function() {
				var chart = obj.chart;
				var offset = obj.chart.get('offset');
				offset=offset+1;
				chart.set('offset', offset);
				chart.draw();
			});

			if(obj.chart.get('pageLimitExceeded')==true){
				$("#" + obj.element)
				.find("#pivot-table-" + obj.element)
				.attr('style','height:'+(parseFloat(obj.chart.get('height'))-35)+'px;width:'+obj.chart.get('width')+'px; overflow: auto;')
				.html("<h4 class='alert alert-warning'>No More records found!</h4>");
			}else{
				new_hierarchy = (obj.hierarchy) ? obj.hierarchy.concat((obj.column_fields) ? obj.column_fields : "") : "";
				var dimensions = new_hierarchy;
				var depth = new_hierarchy.length + 1; 	

				/*
					For supporting multiple measures - we are going to create an illusion (hack) that
					out data has 2 fields - called Measure and Measure Value.
					
					Consider following configs
					hierarchy = ["Head", "Code"]
					columns_fields = ["GL Year"]
					measure_fields = [{"field" => "GL Amount", "format" => "Sum"}, {"field" => "GL Date", "format" => "Count"}]

					Each member of chartData array looks like follows (with multiple measures)
					chartData[0] = {
						"Head" : "Asset",
						"Code" : "Cash",
						"GL Year" : "2012",
						"GL Amount" : { "Sum" : 2,100},
						"GL Date" : { "Count" : 2}
					}

					We want to break this into 2 items (number of items = number of measure_fields) as follows
					item_1 = {
						"Head" : "Asset",
						"Code" : "Cash",
						"GL Year" : "2012",
						"Measure": "GL Amount"
						"Measure_Val" : 2,100
					}
					item_2 = {
						"Head" : "Asset",
						"Code" : "Cash",
						"GL Year" : "2012",
						"Measure": "GL Date"
						"Measure_Val" : 2
					}			
					
					If we do this - then the field "Measure" -- just becomes another column 
					to the pivot table that we have to plot at the lowest level.
				*/ 

				var table_data = [];
				var displayFormat=Cibi.Auth.globalSetting.get('numberFormat');
				if(obj.measure_fields){
					for(var i = 0; i < data.length; i++) {

						var db_item = data[i];
						for(var j = 0; j < obj.measure_fields.length; j++) {
							var item = {}, 
							m_display = obj.measure_fields[j]["displayName"];
						    var dimension=obj.chart.get('dimensions');					
							for(var k = 0; k < obj.hierarchy.length; k++) {
								var key = obj.hierarchy[k];
						        var formats=obj.chart.getDateFormatFunctions(dimension.objectAt(k));
						        var formatDate = formats["formatDate"];
						        var parseDate = formats["parseDate"];	
								item[key] = formatDate ? formatDate(parseDate(db_item[key])) : db_item[key];
							}
							for(var k = 0; k < obj.column_fields.length; k++) {
								var key = obj.column_fields[k];
						        var formats=obj.chart.getDateFormatFunctions(dimension.objectAt(obj.hierarchy.length + k));
						        var formatDate = formats["formatDate"];
						        var parseDate = formats["parseDate"];	
								item[key] = formatDate ? formatDate(parseDate(db_item[key])) : db_item[key];
							}
							item["Measure"] = m_display;
							var measure_val=db_item[m_display];
							// item["Measure"] = ((m_format=="Count,Distinct") ? "Count Unique" : m_format) + "(" + m_field + ")";
							// var measure_val = db_item[m_field][m_format]
							if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
								var value = isNaN(+measure_val) ? measure_val : CommaFormatted(measure_val, displayFormat,cds.get('factFormat'));
							}else{
								var value = isNaN(+measure_val) ? measure_val : CommaFormatted((measure_val), displayFormat);
							}
							var prefix = obj.measure_fields[j]["prefix"];
							var suffix = obj.measure_fields[j]["suffix"];
							if(value && obj.displayUnit){
					    		if(["k, M, B", "k, L, Cr", "Only Lakhs", "Only Crores", "Only Millions", "Only Billions"].contains(obj.displayUnit)){
						  			value = formatValue(value.replace(/,/g,""),obj.displayUnit);
								}else if(obj.displayUnit == "No Units (Indian)"){
									value = CommaFormatted(value.replace(/,/g,""),"Indian");
								}else if(obj.displayUnit == "No Units (American)"){
									value = CommaFormatted(value.replace(/,/g,""),"American");
								}
							}
							if(prefix && prefix.trim().length>0){
								if(prefix == "USD") {
						    		value = " $ " + value;
						    	} else if(prefix == "Rs") {
									value = " ₹ "	+ value;
									// value = " Rs. "	+ value;
						    	} else if(prefix == "Euro") {
						    		value = " € " + value;
						    	}	
							}
					    	if(suffix && suffix.trim().length>0){
								value = value + " " + suffix + " ";
					    	}	
							item["Measure_Val"] = value;
							// item["Measure_Val"] = isNaN(+measure_val) ? measure_val : CommaFormatted(toFloat(measure_val), displayFormat);
							table_data.push(item);
						}				
					}

					var rowTotals = obj.chart.rowTotals;
					if(rowTotals && !obj.hide_row_total /* !="on" */){
						for(var i = 0; i < rowTotals.length; i++) {
							var db_item = rowTotals[i];
							for(var j = 0; j < obj.measure_fields.length; j++) {
								var recordExists=null;
								var item = {}, 
								m_display = obj.measure_fields[j]["displayName"];
							    var dimension=obj.chart.get('dimensions');					
								for(var k = 0; k < obj.hierarchy.length; k++) {
									var key = obj.hierarchy[k];
							        var formats=obj.chart.getDateFormatFunctions(dimension.objectAt(k));
							        var formatDate = formats["formatDate"];
							        var parseDate = formats["parseDate"];	
									item[key] = formatDate ? formatDate(parseDate(db_item[key])) : db_item[key];
									if(k==0){
										recordExists = _.filter(table_data, function(d){
										    return db_item[key] == d[key];
										});	
									}else{
										recordExists = _.filter(recordExists, function(d){
											return d[key] == db_item[key];
										});
										// recordExists = (recordExists) ? recordExists[key] == db_item[key] : false;
									}								
								}
								if(recordExists.length > 0){
									recordExists = true;
								}else{
									recordExists = false;
								}
								for(var k = 0; k < obj.column_fields.length; k++) {
									var key = obj.column_fields[k];
									if(k==0){
										item[key] = "Totals";	
									}else{
										item[key] = "-";
									}
								}
								item["Measure"] = m_display;
								var measure_val=db_item[m_display];
								if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
									var value = isNaN(+measure_val) ? measure_val : CommaFormatted(measure_val, displayFormat,cds.get('factFormat'));
								}else{
									var value = isNaN(+measure_val) ? measure_val : CommaFormatted(toFloat(measure_val), displayFormat);
								}
								var prefix = obj.measure_fields[j]["prefix"];
								var suffix = obj.measure_fields[j]["suffix"];
								if(value && obj.displayUnit){
						    		if(["k, M, B", "k, L, Cr", "Only Lakhs", "Only Crores", "Only Millions", "Only Billions"].contains(obj.displayUnit)){
							  			value = formatValue(value.replace(/,/g,""),obj.displayUnit);
									}else if(obj.displayUnit == "No Units (Indian)"){
										value = CommaFormatted(value.replace(/,/g,""),"Indian");
									}else if(obj.displayUnit == "No Units (American)"){
										value = CommaFormatted(value.replace(/,/g,""),"American");
									}
								}
								if(prefix && prefix.trim().length>0){
									if(prefix == "USD") {
							    		value = " $ " + value;
							    	} else if(prefix == "Rs") {
										value = " ₹ "	+ value;
										// value = " Rs. "	+ value;
							    	} else if(prefix == "Euro") {
										value = " € "	+ value;
									}
								}
						    	if(suffix && suffix.trim().length>0){
									value = value + " " + suffix + " ";
						    	}	
								item["Measure_Val"] = value;
								if(recordExists){
									table_data.push(item);
								}
							}									
						}
					}
				}
				else{
					table_data = data;
				}	
				var col_totals = {};
				if(!obj.hide_column_total /* !="on" */){				
					var rowKeys = obj.hierarchy;
					var columnTotals = obj.chart.columnTotals;
					var columnKeys = obj.column_fields;
					_.each(columnTotals, function(ct){
						_.each(obj.measure_fields, function(m){
							var columnTotal={};
							var key="";
							_.each(columnKeys, function(c, j){
								var formats=obj.chart.getDateFormatFunctions(dimension.objectAt(rowKeys.length + j));
						        var formatDate = formats["formatDate"];
						        var parseDate = formats["parseDate"];
								key=key.concat(formatDate ? formatDate(parseDate(ct[c])) : ct[c]);
							});
							key=key.concat(m["displayName"]);
							if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
								var value=CommaFormatted(ct[m["displayName"]], displayFormat,cds.get('factFormat'));
							}else{
								var value=CommaFormatted(toFloat(ct[m["displayName"]]), displayFormat);
							}
							var prefix = m["prefix"];
							var suffix = m["suffix"];
							if(ct[m["displayName"]] && obj.displayUnit){
					    		var value = formatValue(ct[m["displayName"]].replace(/,/g,""),obj.displayUnit);
								if(obj.displayUnit == "No Units (Indian)"){
									value = CommaFormatted(ct[m["displayName"]].replace(/,/g,""),"Indian");
								}else if(obj.displayUnit == "No Units (American)"){
									value = CommaFormatted(ct[m["displayName"]].replace(/,/g,""),"American");
								}
							}
							if(prefix && prefix.trim().length>0){
								if(prefix == "USD") {
						    		value = " $ " + value;
						    	} else if(prefix == "Rs") {
									value = " ₹ "	+ value;
						    	} else if(prefix == "Euro") {
						    		value = " € " + value;
						    	}	
							}
					    	if(suffix && suffix.trim().length>0){
								value = value + " " + suffix + " ";
					    	}	
							col_totals[key]=value;
						});				
					});	
				}			
				// if(obj.hide_row_total!="on" && obj.hide_column_total!="on")
				if(!obj.hide_row_total && !obj.hide_column_total)
				{
					var colTotalKey = "Totals";
					for(var k = 1; k < obj.column_fields.length; k++) {				
						colTotalKey = colTotalKey.concat("-");
					}
					var grandTotals=(obj.chart.grandTotals) ? obj.chart.grandTotals[0] : null;
					_.each(grandTotals, function(val, key){
						var m=_.find(obj.measure_fields, function(measure){
						    return measure["displayName"]==key;
						});
						if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
							var value=CommaFormatted(val, displayFormat,cds.get('factFormat'));
						}else{
							var value=CommaFormatted(toFloat(val), displayFormat);
						}
						var prefix = m["prefix"];
						var suffix = m["suffix"];
						
						if(value && obj.displayUnit){
				    		if(["k, M, B", "k, L, Cr", "Only Lakhs", "Only Crores", "Only Millions", "Only Billions"].contains(obj.displayUnit)){
					  			value = formatValue(value.replace(/,/g,""),obj.displayUnit);
							}else if(obj.displayUnit == "No Units (Indian)"){
								value = CommaFormatted(value.replace(/,/g,""),"Indian");
							}else if(obj.displayUnit == "No Units (American)"){
								value = CommaFormatted(value.replace(/,/g,""),"American");
							}
						}

						if(prefix && prefix.trim().length>0){
							if(prefix == "USD") {
					    		value = " $ " + value;
					    	} else if(prefix == "Rs") {
								value = " ₹ "	+ value;
					    	} else if(prefix == "Euro"){
					    		value = " € "  + value;
					    	}	
						}
				    	if(suffix && suffix.trim().length>0){
							value = value + " " + suffix + " ";
				    	}

						key=colTotalKey+key;
						col_totals[key]=value;
					});
				}

				var dimensions = obj.chart.get('dimensions');
				var column_fields = obj.column_fields;
				var col_dims = [];
				dimensions.forEach(function(dim){
   					if(column_fields.contains(dim.get('displayName'))){
     					col_dims.push(dim);
					}
				});

				var chartHeight = (limit && parseInt(limit) > 0) ? (parseFloat(obj.chart.get('height'))-35) : (parseFloat(obj.chart.get('height'))+4);
				chartHeight = chartHeight - margin.top - margin.bottom;
				var chartWidth = obj.chart.get('width');
				chartWidth = chartWidth - margin.left - margin.right;
				$("#" + obj.element)
					.find("#pivot-table-" + obj.element)
					.attr('style','height:'+chartHeight+'px;width:'+chartWidth+'px; overflow: auto;')
					// .attr('style','height:'+(parseFloat(obj.chart.get('height'))-35)+'px;width:'+obj.chart.get('width')+'px; overflow: auto;')
					.pivot(table_data, {
						rows: obj.hierarchy,
						cols: (obj.measure_fields) ? obj.column_fields.concat(["Measure"]) : obj.column_fields,
						aggregator: function(data, rowKey, colKey) {				
						  	return {
							  	val: 0,
							    push: function(record) { 
							    	this.val = record["Measure_Val"];
							    },
							    value: function() {
							    	return this.val; 
							    },
							    format: function(x) { 
							    	return x; 
							    },
							    label: "Count"
							}
						},
						col_totals: col_totals,
						col_dims: col_dims,
						chart: obj.chart,
					});

					// if(obj.hide_column_total=="on"){
					if(obj.hide_column_total){
						$("#" + obj.element).find(".pvtTotalLabel.totalCell").hide();
						$("#" + obj.element).find(".pvtTotal.colTotal.totalCell").hide();
					}

				if(drawWithHeatmap){
					var numrows = obj.hierarchy.length;
					var cols = (obj.measure_fields) ? obj.column_fields.concat(["Measure"]) : obj.column_fields;
					var numcols = cols.length;
					$("#" + obj.element)
					.find("#pivot-table-" + obj.element)
					.attr('style','height:'+(parseFloat(obj.chart.get('height'))-35)+'px;width:'+obj.chart.get('width')+'px; overflow: auto;')
					.heatmap(table_data, obj.displayUnit);
				}
				$('table.pvtTable').floatThead({
					scrollContainer: function($table){
						return $table.closest('#pivot-table-' + obj.element);
					},
					useAbsolutePositioning: false
				});

				$('table.pvtTable').floatThead('reflow');
			}
			// $("#" + obj.element).find(".pvtTotalLabel").hide();
			// $("#" + obj.element).find(".pvtTotal").hide();
			// $("#" + obj.element).find(".rowTotal").hide();
			// $("#" + obj.element).find(".colTotal").hide();
			// $("#" + obj.element).find(".pvtGrandTotal").hide();
		}		
		obj.chart.set('dataLoading', false);
		obj.chart.get('dashboard').highlightFilters();
    }
})