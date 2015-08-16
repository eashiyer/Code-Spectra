Cibi.GroupedTableChart = Em.Object.extend({
	init: function() {
		if(!this.hierarchy) {
			throw new Error("Need to define hierarchy");
		}
		this.set("idCounter", 0);
		this.set("root", {});
		// this.generateData();
	},

		/**
		Prepares data for drawing ctable

		@method treeData
	*/
	treeData: function(data, obj) {
		var cds = obj.cds.objectAt(0);
		var dtree = d3.layout.tree()
		 	.children(function(d) {
	       		return (!d.values || d.values.length === 0) ? null : d.values;
		     });
		new_hierarchy = obj.hierarchy.concat(obj.column_fields)
		var dimensions = new_hierarchy;
		var depth = new_hierarchy.length; 	

		obj.root.key =new_hierarchy[0];

		obj.root.values = data;

		if(cds.get('factFormat') == 'count') {
			var displayCount = true;
		}
		var cds = obj.chart.get('chartsDataSources').objectAt(0);
		var factType = cds.get('factType');
		var factUnit = cds.get('factUnit');
		var factFormat = cds.get('factFormat');
			
		var nodes = dtree.nodes(obj.root);	

		group = nodes.filter(function(d){
		  if(d.depth == depth){return d}
		});

		var col_names = group.map(function(g){return g.key}).uniq();

		obj.set('col_names', col_names.slice(0,col_names.length-1));

		var id = 0;
		nodes.map(function(node) {
			if(node.depth == new_hierarchy.length) { 
				var p = node.parent;
				while(p){					
					p[node.key] = node.val
					p = p.parent;
				}	
			}  			

			if( node.values ) {
				node.id = id++;
			} 
			if(node.depth > obj.expansion_depth) {
				node._collapsed = false;
			}

		});

		var cols = col_names.slice(0, col_names.length-1)
		nodes.map(function(node) { 
			if(node.depth > 1) { 
				p = node.parent;						
				$.each(cols, function(i,col){	
					if(p[col] === undefined){
						p[col] =  '-'
					}				
				});
			} 

			$.each(cols, function(i,col){
				if(node[col] !== undefined){
					node[col] = d3.format(",.2f")(node[col]);// displayCount ? d3.format(",s")(node.count) : d3.format(",.2f")(node.sum);
					if(factType == "money") {
					    if(factUnit == "USD") {
					    	node[col] = " $ " + node[col];
					    } else if(factUnit == "Rs") {	
							node[col] = " ₹ "	+ node[col];
			    		} else if(factUnit == "Euro") {
			    			node[col] = " € " + node[col];
			    		}
					}
				}
			});

			if(node.key == 'undefined'){
				if(node.depth > 1){
					p = node.parent;
					$.each(cols, function(i,col){	
						p[col] = node[col] ? node[col] : '-'			
					});				
					delete node.key;
				} else {
					node.key = '--'; //factFormat.toUpperCase() + ':'
				}
				
			}
		});

		nodes = _.filter(nodes, function(node) {
			return node.key && node.values && node.depth !== new_hierarchy.length ;
		});

		return nodes.splice(1, nodes.length);

	},

	// addRowClass: function(dataView) {
	// 	var item
	//    	dataView.getItemMetadata = function(index) { 
 //            item = dataView.getItem(index);
 //            if(item.children) {
 //                return { cssClasses: 'column-totals' };
 //            }
 //            else {
 //                return { cssClasses: 'childRow' };
 //            }

	//    	} 
	// },

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
        var data = cds.chartData(obj._drawGroupedTable, obj, filters);
        // obj.chart.set("isSetup", false);
    },

	_drawGroupedTable: function(data, obj) {
		
		var width = obj.chart.get('width') ;
		var height = obj.chart.get('height');
		obj.chart.clearChart();
		var html = "<div id='" + obj.element + "-grid' style=\"width:" + width + "px;height: " + height + "px\"></div>";
		$("#" + obj.element).html(html);
		var grid_element = $("#" + obj.element + "-grid");
		if(!grid_element || grid_element.length == 0) {
			return ;
		}
		var cds = obj.cds.objectAt(0);
		var nodes = obj.treeData(data, obj);
		var col_names = obj.get('col_names');

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

		var depth = obj.hierarchy.length; 	
		var hierarchy_str = obj.hierarchy.join(" > ");
		var factDisplay = cds.factDisplayStr();		

		var columns = [
		{id: 'key', name: hierarchy_str, field: 'key', width: width - 300, resizable: true, sortable: true, cssClass: 'cell-selection-left', headerCssClass: 'header-left',formatter: KeyFormatter},
		];

		for(var i = 0; i < col_names.length; i++ ) {
			if (col_names[i] == 'id') {
				continue;
			}
			var col_opt = {
				id: col_names[i],
				cssClass: "cell-selection",
				headerCssClass: 'header-right',
				width: 100,
				resizable: true,
				name: col_names[i],
				field: col_names[i],
				sortable: true,	
			}
			columns.push(col_opt);
		}	

		var options = {
		  editable: true,
		  enableAddRow: true,
		  enableCellNavigation: true,
		  asyncEditorLoading: false,
    	  forceFitColumns: true,
    	  forceSyncScrolling: true
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
			} else if ($(e.target).hasClass("leafNode")) {
				var item = dataView.getItem(args.row);
				obj.chart.createModal(item.dataValues, item.key, item.id.toString());
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
		obj.chart.set('dataLoading', false);
		obj.chart.get('dashboard').highlightFilters();
	},


})	