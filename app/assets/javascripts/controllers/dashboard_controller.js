/** 
*@class Cibi.DashboardController
*/

/**
  `Cibi.DashboardController` is the controller class for `Dashboard` model.

  A controller is an object that stores application state. A template can optionally have a controller in addition to a model, and can retrieve properties from both.
  Templates know about controllers and controllers know about models, but the reverse is not true.
  
  @class Cibi.DashboardController
  @extends Ember.ObjectController
*/
Cibi.DashboardController = Ember.ObjectController.extend({

	/**
	  It is called from dashboard.handlebars template. Resets all charts present in current dashboard. That is, remove any filters from charts.
	  A `Dashboard` has_many `Charts`

	  @method reset
	  @param null
	  @return null
	*/
	reset: function() {
		var dashboard = this.get('content');
    dashboard.reset(null, null);
    this.transitionToRoute('dashboard.charts', dashboard); 
	},

  returnToPrevious: function(){
    var dashboard = Cibi.Auth.get("calling_dashboard");
    this.reset(null,null);  
    this.transitionToRoute('dashboard.charts', dashboard); 
  },

  toggleSorting: function(){
    var obj=this;
    var d=obj.get('content');
    var list=$("#"+d.get('tabId')).find(".sortable");
    if(list.length>0){
      var disabled = list.sortable("option", "disabled");
      list.sortable("option","disabled", !disabled);
      if(disabled){
        $("#"+d.get('tabId')).find(".sort-icon").attr('style','background-color:green');
        $("#"+d.get('tabId')).find(".chart-control-bar").css("cursor", "move");
      }else{
        $("#"+d.get('tabId')).find(".sort-icon").attr('style','background-color:#4093cd');
        $("#"+d.get('tabId')).find(".chart-control-bar").css("cursor", "default");
      }  
    }    
  },
  
  resetChartFilter: function(filter, value){
    var dashboard = this.get('content');
    dashboard.reset(filter, value);
  },

	showNewChartForm: function() {
		$("#modal-new-chart").modal();
	},

    getDimensionUniqueVals: function(dimension_name, callback, viewObj) {
      var obj = this;
      //obj.set('unique_vals', []);
  		if(!dimension_name) {
  			return [];
  		}

      	var arr = [];
      	var cds = [];
      	var charts = this.get('content').get('charts');
  		if(!charts) {
  			return [];
  		}
    	charts.forEach(function(c) {
    		cds = cds.concat(c.get('chartsDataSources').objectAt(0));  
    	});
    	cds = cds.uniq(); 
      var length = cds.get('length');  
      var i = 1; 

      var values_hash = {};
      
    	cds.forEach(function(cd) {
    		cd.getUniqueKeys(dimension_name, null, function(data) {
           if(values_hash[dimension_name] != undefined){
            values_hash[dimension_name] = values_hash[dimension_name].concat(data);
            //obj.set('unique_vals', hash);
           } else {
            values_hash[dimension_name] = data;
            //obj.set('unique_vals', hash);
           } 
           if(callback && length == i){
              var uniq = _.sortBy(values_hash[dimension_name].uniq(), function(d) { 
                if(d) {
                  return d.trim();   
                }
              }); 
              values_hash[dimension_name] = uniq;       
              callback(values_hash, viewObj) ;
           }  
           i+= 1;               
        }, cd);
    	});    	
      // return _.sortBy(obj.get('unique_vals').uniq(), function(d) { return d.trim(); });
    },

    set_dashboard_filter: function(data) {
    	var obj = this;
    	var chart_id = obj.get('id');
    	var cfilter = Cibi.DashboardFilter.createRecord(data);
    	cfilter.set('dashboard', obj.get('content'));
      cfilter.set('user', Cibi.Auth.currentUser);
      cfilter.on('didCreate', function() {
        obj.get('content').drawAll();
      })
      cfilter.get('store').commit();

    },

    set_scheduled_report: function(data) {
      var obj = this;
      var report = Cibi.ScheduledReport.createRecord(data);
      report.get('store').commit();
    },

    download: function(target_id) {            
      var obj = this;  
      var content = obj.get('content');
      var dashboard_id = '#dashboards_' + this.get('id')
      
      var width = $(dashboard_id).width();
      var height = $(dashboard_id).height();

      var grid_columns = content.get("columns");
      var grid_rows = content.get("rows");

      var grid_block_width = width/grid_columns;

      var c = document.createElement('canvas');
      c.width = width + 50;
      c.height = height + 200;

      var context = c.getContext('2d');
      context.font = '20pt Roboto-Medium';
      
      context.fillStyle = 'white';
      context.fill();
      context.fillRect(0, 0, c.width, c.height);
      context.strokeStyle = '#666666';
      context.strokeWidth = 0.5;
      context.lineWidth = 1;
      context.stroke();

      //Dashboard Description
      var desc_text = content.get('description');
      if(desc_text && desc_text.length > 0){
        context.textAlign = "right"; 
        context.fillStyle = "#7c7c7c";
        context.font = '14pt Roboto-Light';
        var desc_x = (c.width - 30);
        var desc_y = 30;
        var desc_maxWidth = (c.width/3);
        var desc_lineHeight = 20;
        var words = desc_text.split(" ");
        var line = "";

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + " ";
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > desc_maxWidth && n > 0) {
            context.fillText(line, desc_x, desc_y);
            line = words[n] + " ";
            desc_y += desc_lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, desc_x, desc_y);
      }
      // context = wrapText(context, "description description description description description description", 300, 30, 150, 20);     

      // Dashboard logo
      var logo_src = Cibi.Auth.currentUser.get('get_company_logo_url');
      if(logo_src && logo_src.length > 0){
        var logo = new Image();
        logo.src = logo_src;
        context.drawImage(logo, 30, 30, 200, 50);  
      }      

      //Dashboard title
      context.textAlign = "center";
      context.fillStyle = "#002F6C";
      context.font = '22pt Roboto-Medium';
      context.fillText(this.get('title'), (c.width/2), 100);

      context.textAlign = "left";
      var charts = this.get('content').get('charts');
      var chart_id = '';
      var top = 0;
      var position = 1;
      var grid_blocks = 0;
      var height_count = 0;
      var stored_position = 0;
      var stored_grid_blocks = 0;

      charts.forEach(function(ch){
         chart_id = '#chart-' + ch.id;
         if(height_count == 0 || ch.get('rows') > 1){
          height_count = 0;
         }         
         grid_blocks += ch.get('columns');

         if(position > grid_columns || grid_blocks > grid_columns){
          if(height_count > 0){
            height_count -= 1;
            position = stored_position;
            grid_blocks = stored_grid_blocks;
          }else{
            position = 1
            grid_blocks = 0 
          }        
         }          


         offset_x = 20 + ((position-1) * grid_block_width);

         if(top == 0){
          // offset_x = 20;
          offset_y = 110;
         }else{
            if(top == $(chart_id).offset().top && left != $(chart_id).offset().left){
              // offset_x = width + 20;
            }else if(top != $(chart_id).offset().top && left == $(chart_id).offset().left){
              offset_y = offset_y + height - 50;
            }else{
              // offset_x = 20;
              offset_y = offset_y + height;
            }         
         }

         //Add Chart title if present.
         if(ch.get('title')) {
           context.fillStyle = "#4093cc";
           context.font = '16pt Roboto-Light';
           context.fillText(ch.get('title'), offset_x+15, offset_y+40 );  
         }

         //Add subtitle if present
         if(ch.get('subtitle')) {
           context.fillStyle = "#7c7c7c";
           context.font = '12pt Roboto-Light';
           context.fillText(ch.get('subtitle'), offset_x+15, offset_y+65 );  
         }

          var margin_top=ch.get("marginTop");
          var margin_left=ch.get("marginLeft");
          // this.set("marginTop",40);
          // this.set("marginLeft",50);
          // if(ch.get("chartType")!=2){
          //   $($(chart_id).find("svg").find("g")[0]).attr("transform","translate("+((margin_left>50) ? margin_left : 50)+","+((margin_top>40) ? margin_top : 40)+")");
          // }

          if(["0","7","14"].indexOf(ch.get("chartType")) > -1){
             context.fillStyle = "#7c7c7c";
             context.font = '16pt Roboto-Light';
             context.fillText('Table Charts not supported in dashboard download.', offset_x+50, offset_y+150 );
          }

          context.fillStyle = "#000000";
          context.font = '12pt Roboto-Medium';
          canvg(c, $(chart_id).html(), {offsetX:offset_x+15, offsetY:offset_y+75, ignoreDimensions: true, ignoreClear: true, ignoreAnimation: true, ignoreMouse: true,});      
          
          // if(ch.get("chartType")!=2){
          //   $($(chart_id).find("svg").find("g")[0]).attr("transform","translate("+margin_left+","+margin_top+")");
          // }       

          if(ch.get('hasLegend')) {  

             var legend_elem = $("#" + ch.get('legendId'));
             var legend = $(legend_elem.find(".legend_rect").children())
             var textWidth=0;
              _.each(legend,function(l){
                var e=$(l);
                if(e.attr('data-original-title').length>textWidth){
                  textWidth=e.attr('data-original-title').length; 
                }
              });
             var lineheight = 17;
                    
            var x = offset_x;
            var y = offset_y + $(chart_id).height() +70;
            columns = Math.round($(chart_id).width()/((8*textWidth)+13));
            var allowed_legends = columns*10
            var legend_length = (legend.length > allowed_legends) ? allowed_legends : legend.length
            for(var i = 0; i < legend_length; i++) {
            
              var e = $(legend[i]);
                  
              if((x+(8*textWidth)+20)> $(chart_id).width()+offset_x){
                x=offset_x;
                y=y+lineheight;
              }
            
              context.font="9pt Roboto-Light";
              context.fillStyle=e.attr('style').split(":")[1];
              context.fillRect(x+20, (y + lineheight), 10, 10);
              x=x+13;
              context.fillStyle="black";
              context.fillText(e.attr('data-original-title'),  x+20, y + lineheight+8); 
              x=x+(8*textWidth);
            }    
             height = $(chart_id).height() +180;        
          }else{
             height = $(chart_id).height() +180;
          }

         width = $(chart_id).width();         
         top = $(chart_id).offset().top;
         left = $(chart_id).offset().left ;
         

         position += ch.get('columns');
        
         if(ch.get('rows') > 1 && grid_blocks < grid_columns){
            height_count = ch.get('rows') -1;
            stored_position = position;
            stored_grid_blocks = grid_blocks;
         }
       
      });
       
      if(target_id == "download_pdf"){
          obj.download_pdf(c);
      }else{
        obj.download_png(c);
      }

    },

    download2: function(target_id) {            
      var obj = this;  
      var content = obj.get('content');
      var dashboard_id = '#dashboards_' + this.get('id')
      
      var width = $(dashboard_id).width();
      var height = $(dashboard_id).height();

      var grid_columns = content.get("columns");
      var grid_rows = content.get("rows");

      var grid_block_width = width/grid_columns;

      var c = document.createElement('canvas');
      c.width = width;
      c.height = height + 500;

      var context = c.getContext('2d');
      context.font = '20pt Roboto-Medium';
      
      context.fillStyle = 'white';
      context.fill();
      context.fillRect(0, 0, c.width, c.height);
      context.strokeStyle = '#666666';
      context.strokeWidth = 0.5;
      context.lineWidth = 1;
      context.stroke();

      //Dashboard title
      context.fillStyle = "#222222";
      context.fillText(this.get('title'), 30, 30 );  

      var charts = this.get('content').get('charts');
      var chart_id = '';
      var top = 0;

      charts.forEach(function(ch){
         chart_id = '#chart-' + ch.id;

         if(top == 0){
          offset_x = 20;
          offset_y = 60;
         }else{
            if(top == $(chart_id).offset().top && left != $(chart_id).offset().left){
              offset_x = width + 20;
            }else if(top != $(chart_id).offset().top && left == $(chart_id).offset().left){
              offset_y = offset_y + height - 50;
            }else{
              offset_x = 20;
              offset_y = offset_y + height;
            }         
         }

         //Add Chart title if present.
         if(ch.get('title')) {
           context.fillStyle = "#4093cc";
           context.font = '16pt Roboto-Light';
           context.fillText(ch.get('title'), offset_x+15, offset_y+40 );  
         }

         //Add subtitle if present
         if(ch.get('subtitle')) {
           context.fillStyle = "#7c7c7c";
           context.font = '12pt Roboto-Light';
           context.fillText(ch.get('subtitle'), offset_x+15, offset_y+65 );  
         }

          var margin_top=ch.get("marginTop");
          var margin_left=ch.get("marginLeft");
          // this.set("marginTop",40);
          // this.set("marginLeft",50);
          if(ch.get("chartType")!=2){
            $($(chart_id).find("svg").find("g")[0]).attr("transform","translate("+((margin_left>50) ? margin_left : 50)+","+((margin_top>40) ? margin_top : 40)+")");
          }

          if(["0","7","14"].indexOf(ch.get("chartType")) > -1){
             context.fillStyle = "#7c7c7c";
             context.font = '16pt Roboto-Light';
             context.fillText('Table Charts not supported in dashboard download.', offset_x+50, offset_y+150 );
          }


          canvg(c, $(chart_id).html(), {offsetX:offset_x+15, offsetY:offset_y+35, ignoreDimensions: true, ignoreClear: true, ignoreAnimation: true, ignoreMouse: true,});      
          
          if(ch.get("chartType")!=2){
            $($(chart_id).find("svg").find("g")[0]).attr("transform","translate("+margin_left+","+margin_top+")");
          }       

          if(ch.get('hasLegend')) {  

             var legend_elem = $("#" + ch.get('legendId'));
             var legend = $(legend_elem.find(".legend_rect").children())
             var textWidth=0;
              _.each(legend,function(l){
                var e=$(l);
                if(e.attr('data-original-title').length>textWidth){
                  textWidth=e.attr('data-original-title').length; 
                }
              });
             var lineheight = 17;
                    
            var x = offset_x;
            var y = offset_y + $(chart_id).height() +30;
            columns = Math.round($(chart_id).width()/((8*textWidth)+13));
            var allowed_legends = columns*10
            var legend_length = (legend.length > allowed_legends) ? allowed_legends : legend.length
            for(var i = 0; i < legend_length; i++) {
            
              var e = $(legend[i]);
                  
              if((x+(6*textWidth)+20)> $(chart_id).width()+offset_x){
                x=offset_x;
                y=y+lineheight;
              }
            
              context.font="9pt Roboto-Light";
              context.fillStyle=e.attr('style').split(":")[1];
              context.fillRect(x+20, (y + lineheight), 10, 10);
              x=x+13;
              context.fillStyle="black";
              context.fillText(e.attr('data-original-title'),  x+20, y + lineheight+8); 
              x=x+(6*textWidth);
            }    
             height = $(chart_id).height() +180;        
          }else{
             height = $(chart_id).height() +180;
          }

         width = $(chart_id).width();         
         top = $(chart_id).offset().top;
         left = $(chart_id).offset().left ;
      });
       
      if(target_id == "download_pdf"){
          obj.download_pdf(c);
      }else{
        obj.download_png(c);
      }

    },

    download_png: function(canvas){
        var dataURL = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        var link=document.createElement("a");
          link.href=dataURL;
          link.download=this.get("title")+".png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
    },

    download_pdf: function(canvas){
        var obj = this;
        var auth_token = Cibi.Auth.get('authToken');
        var url="/dashboards/"+obj.get('id')+"/download_svg?auth_token=" + auth_token;        

        $.ajax({
                url: url,
                type: 'post',
                data: {'svg': canvas.toDataURL("image/jpeg")},
                async: false,
                success: function(response, msg) {
                  var link=document.createElement("a");
                  link.href="/"+response['filename'];
                  link.download=response['filename'];
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                      $.ajax({
                          url: "/dashboards/"+obj.get('id')+"/delete_temp_pdf?auth_token=" + auth_token,
                          type: 'post',
                          data: {'filename': response['filename']},
                          async: true
                        });
                },
                error: function(req, msg, err) {
                  console.log(msg);
                }
          });
    },

    dashboardFiltersId: function() {
      return "dashboard-filters-" + this.get('id');
    }.property('id'),


});
