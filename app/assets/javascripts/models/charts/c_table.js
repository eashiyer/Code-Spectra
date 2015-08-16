/**
@module charts
@class Cibi.CTable
*/

/**
  `Cibi.CTable` is an Ember Object class representing ctable.

  It contains methods specific to ctable.

  @class Cibi.CTable
  @module charts
*/

Cibi.CTable = Ember.Object.extend({
	init: function() {
		// if(!this.hierarchy) {
		// 	throw new Error("Need to define hierarchy");
		// }
		this.set("idCounter", 0);
		this.set("root", {});
		// this.generateData();
	},

	/**
		Prepares data for drawing ctable

		@method treeData
	*/
	treeData: function(chartData, obj) {
		var cds = obj.cds.objectAt(0);
		var measures = obj.chart.get('measures');
		var dtree = d3.layout.tree()
		 	.children(function(d) {
	       		return (!d.values || d.values.length === 0) ? null : d.values;
		     });
	 	var hierarchy = [];

		obj.chart.get('dimensions').forEach(function(d){
			hierarchy.push(d.get('fieldName'));
		});		 	

		obj.root.key = hierarchy[0];
		obj.root.values = chartData;

		if(cds.get('factFormat') == 'count') {
			var displayCount = true;
		}
		var cds = obj.chart.get('chartsDataSources').objectAt(0);
		var factType = cds.get('factType');
		var factUnit = cds.get('factUnit');
		var fact = cds.get('factDisplay');
		

		var nodes = dtree.nodes(obj.root);

		var id = 0;
		nodes.map(function(node) {
			// node.collapsed = false;
			if(node.depth == hierarchy.length) {
				node.isLeafNode = true;
				node.dataValues = node.values;
			} 
			if( node.values ) {
				node.id = id++;
			} 
			if(node.depth > obj.expansion_depth) {
				node._collapsed = true;
			}
			measures.forEach(function(mes){
				var val = mes.get('displayName');
				node[val] = d3.format(",.2f")(node[val]);// displayCount ? d3.format(",s")(node.count) : d3.format(",.2f")(node.sum);
				if(obj.displayUnit){
					if(obj.displayUnit == "k, M, B" || obj.displayUnit == "k, L, Cr"){
						node[val] = formatValue(node[val].replace(/,/g,""),obj.displayUnit);
						// node[fact]=node.val;
					}else if(obj.displayUnit == "No Units (Indian)"){
						node[val] = CommaFormatted(node[val].replace(/,/g,""),"Indian");
						// node[fact]=node.val;
					}else if(obj.displayUnit == "No Units (American)"){
						node[val] = CommaFormatted(node[val].replace(/,/g,""),"American");
						// node[fact]=node.val;
					}
				}
				if(factType == "money") {
				    if(factUnit == "USD") {
				    	node[val] = " $ " + node[val];
				    } else if(factUnit == "Rs") {
						node[val] = " ₹ "	+ node[val];
		    		} else if(factUnit == "Euro") {
		    			node[val] = " € " + node[val];
		    		}
				}
			});
			
		});
		nodes = _.filter(nodes, function(node) {
			return node.key && node.values;
		});

		return nodes.splice(1, nodes.length);

	},

    /**
      This method draws a ctable within the html element specified in configObj.

	  @method draw
    */

    draw: function() {
        var obj = this;
        var charts_data_sources = obj.chart.get('chartsDataSources');
        var cds = charts_data_sources.objectAt(0);
        var filters = obj.chart.getFilters();
        obj.set('cds_properties', cds.getProperties(["depth", "fact", "dimensionName", "dimensionFormatAs", "factFormat"]));
        obj.chart.set('dataLoading', true);
        var data = cds.chartData(obj._drawCTable, obj, filters);
        obj.chart.set("isSetup", false);
    },

	_drawCTable: function(data, obj) {
        
		var width = obj.chart.get('width') ;
		var height = obj.chart.get('height') - 24;
		obj.chart.clearChart();
		var html = "<div class='row'><button id = '"+obj.element+"-expand' class='pull-right btn' style='margin-left: 5px;height: 25px;padding: 3px;padding-top: 1px;'><a>Expand All</a></button><button id = '"+obj.element+"-collapse' class='pull-right btn' style='height: 25px;padding: 3px;padding-top: 1px;'><a>Collapse All</a></button></div>"
		html += "<div id='" + obj.element + "-grid' style=\"width:" + width + "px;height: " + height + "px\"></div>";
		$("#" + obj.element).html(html);
		var grid_element = $("#" + obj.element + "-grid");
		if(!grid_element || grid_element.length == 0) {
			return ;
		}
		
	 	var hierarchy = [];

		obj.chart.get('dimensions').forEach(function(d){
			hierarchy.push(d.get('fieldName'));
		});

		var nodes = obj.treeData(data, obj);		

		var KeyFormatter = function (row, cell, value, columnDef, dataContext) {
			value = value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
			var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["depth"]) + "px'></span>";
			var idx = dataView.getIdxById(dataContext.id);
			if(nodes[idx] && nodes[idx].isLeafNode === true) {
				value = "<a class='leafNode'>"+value+"</a>";
			}
			if (nodes[idx + 1] && nodes[idx + 1].depth > nodes[idx].depth) {
				if (dataContext._collapsed) {
					return spacer + " <span class='toggle expand'></span>&nbsp;" + value;
				} else {
					return spacer + " <span class='toggle collapse'></span>&nbsp;" + value;
				}
			} else {
				return spacer + " <span class='toggle'></span>&nbsp;" + value;
			}
		};		

		function myFilter(item) {
		  if (item.parent != null) {
		    var parent = item.parent;

		    while (parent) {
		      if (parent._collapsed ) {
		        return false;
		      }

		      parent = parent.parent;
		    }
		  }

		  return true;
		}

		function get_data_values(item, arr){
			_.each(item, function(it){
				if(it.dataValues){
					arr = arr.concat(it.dataValues);
				}else{
					arr = arr.concat(get_data_values(it.values, arr));
				}
			});
			return arr;
		}		

		var hierarchy_str = hierarchy.join(" > ");
		var cds = obj.cds.objectAt(0);
		// var factDisplay = cds.factDisplayStr();
		
		var columns = [
			{id: 'key', name: hierarchy_str, field: 'key', width: width - 200, resizable: true, sortable: true, cssClass: 'cell-selection-left', formatter: KeyFormatter}
		];

		var measures = obj.chart.get('measures');
		measures.forEach(function(m){
			var fieldName = m.get('fieldName');
			var factDisplay=m.get('displayName');
			columns.push({id: fieldName, name: factDisplay, field: factDisplay, width: 200, resizable: true, sortable: true, cssClass: 'cell-selection'})	
		});
		

		var options = {
		  editable: true,
		  enableAddRow: true,
		  enableCellNavigation: true,
		  asyncEditorLoading: false,
		  fullWidthRows: true
		};

		// initialize the model
		var dataView = new Slick.Data.DataView();
		dataView.beginUpdate();
		dataView.setItems(nodes);
		dataView.setFilter(myFilter);
		dataView.endUpdate();


		// initialize the grid
		var grid = new Slick.Grid(grid_element, dataView, columns, options);
		grid.onCellChange.subscribe(function (e, args) {
			dataView.updateItem(args.item.id, args.item);
		});
		grid.onAddNewRow.subscribe(function (e, args) {
			var item = {
				"id": "new_" + (Math.round(Math.random() * 10000)),
				"indent": 0,
				"key": "New Key",
				"val": "0",
			};
			$.extend(item, args.item);
			dataView.addItem(item);
		});
		grid.onClick.subscribe(function (e, args) {
			if ($(e.target).hasClass("toggle")) {
				var item = dataView.getItem(args.row);
				if (item) {
					if (!item._collapsed) {
					  item._collapsed = true;
					} else {
					  item._collapsed = false;
					}
					dataView.updateItem(item.id, item);
				}
				e.stopImmediatePropagation();
			} else {
				var item = dataView.getItem(args.row);				
				var dataValuesArr=[];
				if(item.dataValues){
					dataValuesArr = dataValuesArr.concat(item.dataValues);
				}else{
					dataValuesArr = get_data_values(item.values, dataValuesArr);
				}
				dataValuesArr = dataValuesArr.uniq();
				_.each(dataValuesArr, function(dataVal){
					delete dataVal.count;
					measures.forEach(function(mes){
						var val = mes.get('displayName');
						delete dataVal[val];	
					});
				});
				obj.chart.createModal(dataValuesArr, item.key, item.id.toString());
				e.stopImmediatePropagation();
			}
		});

		// wire up model events to drive the grid
		dataView.onRowCountChanged.subscribe(function (e, args) {
			grid.updateRowCount();
			grid.render();
		});

		dataView.onRowsChanged.subscribe(function (e, args) {
			grid.invalidateRows(args.rows);
			grid.render();
		});		

		$("#" + obj.element).find("#"+obj.element+"-expand").on("click", function() {
			var items = dataView.getItems();
			dataView.beginUpdate();
            for (var i = 0; i < items.length; i++) {
            	items[i]._collapsed = false;
            	dataView.updateItem(items[i].id, items[i]);
            }
            dataView.endUpdate();
		});

		$("#" + obj.element).find("#"+obj.element+"-collapse").on("click", function() {
			var items = dataView.getItems();
			dataView.beginUpdate();
            for (var i = 0; i < items.length; i++) {
            	items[i]._collapsed = true;
            	dataView.updateItem(items[i].id, items[i]);
            }
            dataView.endUpdate();
		});

		obj.chart.set('dataLoading', false);
		$("#" + obj.element).css("text-align","left");
		obj.chart.get('dashboard').highlightFilters();
	},

});
