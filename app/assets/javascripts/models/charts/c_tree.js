/**
@module charts
@class Cibi.CTree
*/

/**
  `Cibi.CTree` is an Ember Object class representing ctree.

  It contains methods specific to ctree.

  @class Cibi.CTree
  @module charts
*/

Cibi.CTree = Ember.Object.extend({
	init: function() {
		// if(!this.chart.get('dimensions')) {
		// 	throw new Error("Need to define hierarchy");
		// }
		this.set("idCounter", 0);
		this.set("root", {});
	},

	/**
		Prepares data for drawing ctree

		@method generateData
	*/
	generateData: function() {
		var obj = this;
		var dimensionData = this.dimension.top(this.count);
		var nestHierarchy = d3.nest();
		this.hierarchy.forEach(function(i) {
			nestHierarchy.key(function(d) { return d[i];})	
		}); 
		if(obj.fact) {
			nestHierarchy.rollup(function(leaves) { 
				return d3.sum(leaves, function(d) {
					return parseFloat(d[obj.fact].replace(/,/g, ""));
				}); 
			});
		}
		this.set("data", nestHierarchy.entries(dimensionData));
	},

    draw: function() {
        var obj = this;
        var hierarchy=[];
        for(var i=0;i<obj.chart.get('dimensions').get('length');i++){
        	hierarchy.push(obj.chart.get('dimensions').objectAt(i).get('displayName'));
        }
		this.set("hierarchy",hierarchy);
        $("#" + this.element).html("");
        var charts_data_sources = obj.chart.get('chartsDataSources');
        var cds = charts_data_sources.objectAt(0);
        // if((cds.get('measures').get('length')!=1)
        // 	|| (cds.get('dimensions').get('length')<1)){
        // 	$("#" + obj.element).html("<div class='alert alert-error'>Improper Configuration</div>");
        // }
        // else{
        	var filters = obj.chart.getFilters();
	        obj.set('cds_properties', cds.getProperties(["depth", "fact", "dimensionName", "dimensionFormatAs", "factFormat"]));
	        obj.chart.set('dataLoading', true);
	        var data = cds.chartData(obj._drawChart, obj, filters);
	        obj.chart.set("isSetup", false);	
        // }        
    },

   /**
      This method draws a ctree within the html element specified in configObj.

	  @method draw
    */
	_drawChart: function(data, self) {
        var obj = self;
		
		var marginTop = obj.chart.get('marginTop')
		var marginBottom = obj.chart.get('marginBottom')
		var marginLeft = obj.chart.get('marginLeft')
		var marginRight = obj.chart.get('marginRight')
		var width = obj.chart.get('width');
		var height = obj.chart.get('height');
		var m = [marginTop, marginRight, marginBottom, marginLeft],
		    w = width - m[1] - m[3],
		    h = height - m[0] - m[2];
		    
		obj.set("tree", d3.layout.tree()
		    .size([h, w])
		    .children(function(d) {
		      return (!d.values || d.values.length === 0) ? null : d.values;
		    }));

		obj.set("diagonal", d3.svg.diagonal()
	    	.projection(function(d) { return [d.y, d.x]; }));

		obj.set("vis", d3.select("#" + obj.element).append("svg:svg")
		    .attr("width", w + m[1] + m[3])
		    .attr("height", h + m[0] + m[2])
			.append("svg:g")
		    .attr("transform", "translate(" + m[3] + "," + m[0] + ")"));		    	

		obj.root.key = obj.hierarchy[0];
		obj.root.values = data;
		obj.root.x0 = h / 2;
		obj.root.y0 = 0;
		function toggleAll(d) {
		    if (d.values instanceof(Array)) {
		      d.values.forEach(toggleAll);
		      obj.toggle(d);
		    }
		  }
	  	obj.root.values = _.sortBy(obj.root.values, function(d) {
	  		return d.key;
	  	});
	  	

  	    // Initialize the display to show a few nodes.
	    obj.root.values.forEach(toggleAll);
	    obj.update(obj.root);
	    obj.chart.set('dataLoading', false);
	    obj.chart.get('dashboard').highlightFilters();
	},

   /**
      This method updates the tree layout based on the nodes that are toggled.(opened or closed)

	  @method update
    */
	update: function(source) {
		var obj = this;
		var duration = d3.event && d3.event.altKey ? 5000 : 500;

		// Compute the new tree layout.
		var nodes = obj.tree.nodes(obj.root).reverse();


		// Normalize for fixed-depth.
		nodes.forEach(function(d) { d.y = d.depth * 180; });

		// Update the nodes‚Ä¶
		var node = obj.vis.selectAll("g.node")
		  .data(nodes, function(d) { 
		  	var nodesData =  d.id || (d.id = (++obj.idCounter) + obj.element) ; 
		  	return nodesData;
		  });

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("svg:g")
		  .attr("class", "node")
		  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		  .on("click", function(d) { 
		  	if(d.depth != obj.hierarchy.length) {
		  		obj.toggle(d); 
		  		obj.update(d); 				
		  	} else {
				$("#" + obj.element).append(obj.chart.createModal(d._values, d.key));
				$("#modal-" + d.id).modal();

		  	}
		  });

		nodeEnter.append("svg:circle")
		  .attr("r", 1e-6)
		  .style("fill", function(d) { 
		  	return d._values ? "lightsteelblue" : "#fff"; 
		  })
		  .style('stroke', 'steelblue')
		  .style('stroke-width', '1.5px');
  
		nodeEnter.append("svg:text")
		  .attr("y", function(d) { 
		  	return d.values || d._values ? -7 : 7; 
		  })
		  .attr("x", function(d) { 
		  	return - d.key.length *2;
		  })
		  .attr("dy", ".15em")
		  .attr("id", function(d) { 
		  	return d.id
		  })
		  .attr("text-anchor", function(d) { 
		  	return "start";//d.values || d._values ? "end" : "start"; 
		  })
		  .text(function(d) {  
		  	return d.key; 
		  })
		  .style("fill-opacity", 1e-6)
		  .style("font-size", '11px')
		  .style("fill", '#222222');

		// Transition nodes to their new position.
		var nodeUpdate = node.transition()
		  .duration(duration)
		  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

		nodeUpdate.select("circle")
		  .attr("r", 4.5)
		  .style("fill", function(d) { 
		  	return d._values && d._values[0]._values ? "lightsteelblue" : "#fff"; 
		  });

		nodeUpdate.select("text")
		  .style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
		  .duration(duration)
		  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		  .remove();

		nodeExit.select("circle")
		  .attr("r", 1e-6);

		nodeExit.select("text")
		  .style("fill-opacity", 1e-6);

		// Update the links‚
		var link = obj.vis.selectAll("path.link")
		  .data(obj.tree.links(nodes), function(d) { 
		  	return d.target.id;
		  });

		// Enter any new links at the parent's previous position.
		link.enter().insert("svg:path", "g")
			.style('fill', 'none')
	        .style('stroke', '#CCCCCC')
			.attr("class", "link")
			.attr("d", function(d) {
			  var o = {x: source.x0, y: source.y0};
			  return obj.diagonal({source: o, target: o});
			})
		.transition()
		  .duration(duration)
		  .attr("d", obj.diagonal);

		// Transition links to their new position.
		link.transition()
		  .duration(duration)
		  .attr("d", obj.diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
		  .duration(duration)
		  .attr("d", function(d) {
		    var o = {x: source.x, y: source.y};
		    return obj.diagonal({source: o, target: o});
		  })
		  .remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	},

   /**
      This method toggle the passed node.

	  @method toggle
	  @param {Object} d a single node.
    */
	toggle: function(d) {
	  if (d.values instanceof Array) {
	    d._values = d.values;
	    d.values = null;
	    d.children = null; // d3.tree.links depends on "children"
	  } else {
	    d.values = _.sortBy(d._values, function(d) {
	    	return d.key;
	    });
	    d._values = null;
	  }
	}

});