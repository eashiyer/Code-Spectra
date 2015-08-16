Cibi.TreeTableView = Ember.View.extend({
	templateName: 'chart_types/tree_table',

	tableCellView: Ember.View.extend({
		templateName: "chart_types/tree_table_cell",

		toggle: function(e) {
			var obj = this;
			if(this._context.isLeafNode) {
				var modal_html = this.modalDrillDown(this._context);
				$("#" + this.elementId).append(modal_html);
				$("#modal-" + this._context.id).modal();
			} else {
				var children = this._context.children;
				if(children) {
					children.forEach(function(child) {
						var elem = $("#collapsible-table-row-" + child.id);
						var className = elem.attr('class');
						if(className.indexOf('collapsed') === -1) {
							elem.addClass("collapsed");
							if(child.children) {
								obj.collapse(child.children);
							}
						} else {
							elem.removeClass("collapsed");
						}
					});
				}			
			}
		},

		collapse: function(children) {
			var obj = this;
			children.forEach(function(child) {
				var elem = $("#collapsible-table-row-" + child.id);
				elem.addClass("collapsed");
				if(child.children) {
					obj.collapse(child.children);
				}
			});
		},

 		elemId: function() {
			return 'collapsible-table-row-' + this._context.id;
		}.property('this'),

		className: function() {
			if(this._context.collapsed) {
				return "collapsed";
			} 
			return "";
		}.property('this'),

		modalDrillDown: function(node) { 
			var obj = this;
			var v = node.children;
			var title = "Summary";
			var html = "<div id='modal-" + node.id + "' class='modal large-modal hide fade'>";
			html += '<div class="modal-header">'
			html += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
			html += '<h3 id="myModalLabel">' + title + '</h3>';
			html += '</div><!-- modal-header -->';
			html += '<div class="modal-body">';
			html += '<table class="table table-bordered">';
			
	      var o = v[0];
	      html += "<tr>";
	      for(i in o) {
	        if(i != 'x' && i != 'y' && i != 'parent' && i != 'depth' && i != 'id' && i != 'sum') { // dont show tree attribs
	          html += '<th>' + i + '</th>';
	        }
	      }
	      html += "</tr>";

	      for(var j = 0; j < v.length; j++) {
	        html += "<tr>";
	        var o = v[j];
	        for(i in o) {
	          if(i != 'x' && i != 'y' && i != 'parent' && i != 'depth' && i != 'id' && i != 'sum') { // dont show tree attribs
	            html += '<td>' + o[i] + '</td>'
	          }
	        }
	        html += "</tr>";
	      }


			html += '</table>';
			html += '</div><!-- modal-body -->';
			html += "</div>";
			return html;
		}

	}),
});
		
