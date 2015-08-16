Cibi.DataSourceView = Ember.View.extend({

	didInsertElement: function(){
		this.generate_pagination();
	},

	change_dataContents: function(){
		var obj = this;
		var element_id = obj.get("controller").get("id");
		var ds = obj.get("controller").get("content");
		obj.gotoPage(1,element_id,5,obj,ds);
		obj.generate_pagination();
	},

	changePagination: function(){
		var obj = this;
		if(obj.state == "inDOM" && $('.data-source-nav li.active').text().trim() == "Data Content") {
			var element_id = obj.get("controller").get("id");
			var ds = obj.get("controller").get("content");
			var page_no = ds.get('pageno');
			obj.gotoPage(page_no,element_id,5,obj,ds);
			// obj.generate_pagination();
		}
	}.observes('controller.content.fieldsStr'),

	checkTab:function(){
		$('.data-source-nav li').removeClass('active');
		$('#content').removeClass('active');
		$('#query').removeClass('active');
		$('#spree').removeClass('active');
		$('#data_model').addClass('active');
		$('#model').addClass('active');
	}.observes('controller.id','controller.isLoaded'),
	
	generate_pagination:function(){
		var obj = this;
		var element_id = obj.get("controller").get("id");
		var pagination = 5;
		var ds = obj.get("controller").get("content");
		var count = ds.get('total_contents');
		var total_pages = Math.ceil(count/pagination);

		if(total_pages > 0){
			var html = '<div id = "pagination'+element_id+'" class="pagination pagination-centered">'
			html += '<input class="hidden" style="width:0px;" type="text" value="1" id="current_page"></input>'
			html += '<ul style="vertical-align: middle;">'
			    html += '<li class="disabled"><a href="javascript:void(0);" id="previous">&laquo;</a></li>'
			    html += '<li class="active"><a href="javascript:void(0);" id="data_source_'+element_id+'pg_1">1</a></li>'
			    for(var j = 2; j <= Math.min(total_pages,5); j++) {
			    	html += '<li class=""><a href="javascript:void(0);" id="data_source_'+element_id+'pg_'+j+'">'+j+'</a></li>'
				}
		    	if(Math.ceil(total_pages)>=5){
		    		html += '<li class="active"><a href="javascript:void(0);" id="data_source_'+element_id+'pg_'+j+'">..</a></li>'
		    	}
		    if( total_pages > 1 ) {
		    	html += '<li class=""><a href="javascript:void(0);" id="next">&raquo</a></li>'	
		    }
		    
		    html += '</ul>'
			html += '<span class="pull-right" style="padding-right:10px;margin-top: 10px;">Page 1 of '+ total_pages +'</span>'		  
			html += '</div>';
			$('div.data-contents').html(html);

			$('div.data-contents').show();
			$('div.data-contents').find('#pagination' + element_id);
			for(var j = 1; j <= total_pages; j++) {
			   $('div.data-contents').find('#pagination'+element_id).on('click','#data_source_'+element_id+'pg_'+j, function(page) {
			      return function() {
			      	obj.gotoPage(page,element_id,pagination, obj,ds);
			      };
			   }(j));	    	
			}

			// function for previous link.
			$('div.data-contents').find('#pagination'+element_id).on('click','#previous', function() {
	  			var page = $('#current_page').val();
	  			if(parseInt(page) > 1 ){
					obj.gotoPage(parseInt(page)-1,element_id,pagination,obj,ds);
	  			}	      	
		    });

		    // function for next link.
		    $('div.data-contents').find('#pagination'+element_id).on('click','#next', function() {
	      		var page = $('#current_page').val();
	  			if(parseInt(page) < total_pages ){
					obj.gotoPage(parseInt(page)+1,element_id,pagination,obj,ds);
	  			}else{

	  			}	
		    });
		}else{
			$('div.data-contents').hide();
		}
	},

	gotoPage: function(pageno,element_id,pagination, obj,ds){
		var auth_token = Cibi.Auth.get('authToken');
		var url_str = '/data_sources/'+element_id+'/getDataContents?auth_token='+auth_token;
		url_str = url_str + "&pageno=" + pageno;
		var data;
		var count;
		console.log(url_str);
		req = $.ajax({
            url: url_str,
            type: 'get',
            async: false,
            success: function(result) {
            	data = result['data_contents'];
            	count = result['count'];
            	ds.set('data_contents',data);
            	ds.set('pageno',pageno);
            	if(count || count == 0){
            		ds.set('total_contents',count);
            		obj.generate_pagination();
            	}else{
            		obj.change_page(pageno,element_id,pagination,ds);
            	}            	
            }
        });
	},

	change_page: function(current_page,element_id, pagination,ds) {
    	var count = ds.get('total_contents');
    	var total_pages = Math.ceil(count/pagination);
		if(current_page <= 3){
			var min = 1;
			var max = (total_pages<5) ? total_pages : 5; 
		} else if(current_page >= total_pages - 2) {
			var min = (total_pages<5) ? 1 : total_pages -4;
			var max = total_pages;
		} else {
			var min = Math.max(1,current_page-2);
			var max = Math.min(total_pages,current_page+2);
		}
		var next_state = ((current_page == 1 && total_pages == 1) || current_page == total_pages) ? 'disabled' : ''
		var previous_state = (current_page == 1) ? 'disabled' : ''
    	html = ''
    	html += '<input class="hidden" style="width:0px;" type="text" value="'+current_page+'" id="current_page"></input>'
		html += '<ul style="vertical-align: middle;">'
		html += '<li class="'+previous_state+'"><a href="javascript:void(0);" id="previous">&laquo;</a></li>'
	    if(current_page>3 && total_pages>5){
	    	html += '<li class="disabled"><a href="javascript:void(0);">..</a></li>'
	    }
		for(var j = min; j <= max; j++) {
			var style = (j==current_page) ? 'active' : ''
		  	html += '<li class='+style+'><a href="javascript:void(0);" id="data_source_'+element_id+'pg_'+j+'">'+j+'</a></li>'
		}
	    if(total_pages>5 && current_page+2 < total_pages){
	    	html += '<li class="disabled"><a href="javascript:void(0);">..</a></li>'
	    }
		html += '<li class="'+next_state+'"><a href="javascript:void(0);" id="next">&raquo</a></li>'
		html += '</ul>'
		html += '<span class="pull-right" style="padding-right:10px;margin-top: 10px;">Page '+ current_page +' of '+ total_pages +'</span>'		
		$('#pagination'+element_id).html(html);
    },
	
	isUnique: function(self){
		return true;
	}.property(''),

	deleteDataSource: function(ds){
		var c=confirm("Are you sure you want to delete this data-source?");
		if(c === true){
			ds.deleteRecord();
             var vertical_controller = this.get('parentView').get('controller');
             var vertical = vertical_controller.get('content');	
            ds.on('didDelete', function() {
              // vertical.reload();
              vertical.set('dataSourceDeleted', true);
		      setTimeout(function() {
			  vertical.set('dataSourceDeleted', null);
		      }, 5000);   				 
			});
          
		   vertical_controller.transitionToRoute('data_sources');
		   ds.get('transaction').commit();	
		}

	},

	getDashboardColor: function(){
    	var current_user = Cibi.Auth.get('currentUser');
    	if(current_user){
      		return current_user.get('get_dashboard_color');
    	}
  	}.property('Cibi.Auth.currentUser.isLoaded'),

  	accountTopNavColor: function(){
  		var currentUser = Cibi.Auth.get('currentUser');
  		var dbarColor = this.get('getDashboardColor');
  		if(dbarColor != undefined){
  			if(currentUser.get('dashboardBarColor') != undefined){
  				dbarColor = currentUser.get('dashboardBarColor');
  			}
  			dbarColor = "background-color:"+dbarColor+";min-height:44px;display:visible; padding-left:4px; padding-right:15px;";
  		}
  		return dbarColor;
  	}.property('Cibi.Auth.currentUser.isLoaded'),

	check_dataTypes: Ember.View.extend({
		templateName: 'data_sources/check_dataTypes',
	  	datatypes: [
		    {label: "String", value: "varchar"},
		    {label: "Text", value: "text"},
		    {label: "LongText", value: "longtext"},
	    	{label: "Integer",    value: "int"},
	    	{label: "Decimal",    value: "decimal"},
	    	{label: "Boolean", value: "boolean"},
	    	{label: "Date", value: "date"},
	    	{label: "DateTime", value: "datetime"},
	    	{label: "Time", value: "time"},
	  	],

	  	date_seperators: ['-', '/'],

	  	date_formats: ['Month, Day, Year','Day, Month, Year','Year, Month, Day'],

	  	date_formats_dash: ['mm-dd-yy', 'mm-dd-yyyy', 'dd-mm-yy', 'dd-mm-yyyy', 'd-m-yy', 'm-d-yy', 'dd-MON-yy', 'dd-MON-yyyy', 'yy-mm-dd', 'yyyy-mm-dd'],

	  	date_formats_slash: ['mm/dd/yy', 'mm/dd/yyyy', 'dd/mm/yy', 'dd/mm/yyyy', 'd/m/yy', 'm/d/yy', 'dd/MON/yy', 'dd/MON/yyyy', 'yy/mm/dd', 'yyyy/mm/dd'],

	  	time_seperators: [':', 'space'],

	  	time_formats_colon: ['hh:mm', 'hh:mm AM/PM', 'hh:mm:ss', 'hh:mm:ss AM/PM'],	 	  	  	

	  	time_formats_space: ['hh mm', 'hh mm AM/PM', 'hh mm ss', 'hh mm ss AM/PM'],

	  	alias: function(){
	  		return this.get('content').name;
	  	}.property(''),	

	  	varchar: function(){
	  		return this.seleted_datatype == 'varchar'
	  	}.property('seleted_datatype'),

	  	no_options: function(){
	  		return ['int','text','longtext','boolean'].contains(this.seleted_datatype);
	  	}.property('seleted_datatype'),

	  	decimal: function(){
	  		return this.seleted_datatype == 'decimal'
	  	}.property('seleted_datatype'),		  	

	  	date: function(){
	  		return this.seleted_datatype == 'date'
	  	}.property('seleted_datatype'),	 

	  	datetime: function(){
	  		return this.seleted_datatype == 'datetime'
	  	}.property('seleted_datatype'),

	  	time: function(){
	  		return this.seleted_datatype == 'time'
	  	}.property('seleted_datatype'),	  

	  	valid_date_separator: function(){
	  		value = this.get_first_value();
	  		flag = (value.indexOf('-') != -1) ? true : (value.indexOf('/') != -1) ? true : false;
	  		return flag;
	  	}.property(''),

	  	dash_format: function(){
	  		value = this.get_first_value();
	  		flag = (value.indexOf('-') != -1) ? true : false;
	  		return flag;
	  	}.property(''),

	  	slash_format: function(){
	  		value = this.get_first_value();
	  		flag = (value.indexOf('/') != -1) ? true : false;
	  		return flag;
	  	}.property(''),	  		 

	  	get_first_value: function(){
 		  	var field_name = this.get('content')['name'];
	  		var arr = JSON.parse(this.get('controller').get('content').get('fieldsStr'));
	  		arr = _.map(arr, function(f){return f['name']});
	  		position = arr.indexOf(field_name);
	  		value = JSON.parse(this.get('controller').get('content').get('previewData'))['data'][0][position];	  		
	  		return value;
	  	},

	  	colon_format: function(){
	  		var field_name = this.get('content')['name'];
	  		var arr = JSON.parse(this.get('controller').get('content').get('fieldsStr'));
	  		arr = _.map(arr, function(f){return f['name']});
	  		position = arr.indexOf(field_name);
	  		value = JSON.parse(this.get('controller').get('content').get('previewData'))['data'][0][position];	  		
	  		flag = (value.indexOf(':') != -1) ? true : false;
	  		return flag;
	  	}.property(''),	  	 		  	 		  	

	}),	

	saveButtonView: Ember.View.extend({
		template: Ember.Handlebars.compile("<button {{bindAttr class=':btn :btn-info flat-button enabled'}}>Save</button>"),
		enabled: '',

		// init: function() {
		// 	this._super();
		// 	var enabled = this.get('controller').get('content').get('isDirty') ? '' : 'disabled';
		// 	this.set('enabled', enabled);
		// },

		click: function() {
			var arr = [];
			var unique_keys = [];
			var ignored_keys = [];
			$('.fieldsList').each(function() {
				var hash = {};			
	          	var name = $(this).find('label').text().trim();
	          	var data_type = $(this).find('.data_type').val();
	          	//var index = $(this).find('#index').is(':checked');
	          	var alias = $(this).find('label').text().trim();
	          	var default_value = $(this).find('.default_value').val();
	          	var options = {};

	          	//options['date_seperator'] = $(this).find('.date_seperator').val();
	          	options['date_format'] = $(this).find('.date_format').val();
	          	//options['time_seperator'] = $(this).find('.time_seperator').val();
	          	options['time_format'] = $(this).find('.time_format').val();

				options['max_digits'] = $(this).find('.max_digits').val();
				options['max_decimals'] = $(this).find('.max_decimals').val();

				options['string_length'] = $(this).find('.string_length').val();
				
	          	var ignored = $(this).find('.ignored').is(':checked');
	          	if(ignored){
	          		var key=name;
	          		ignored_keys.push(key);
	          	} else {
		          	hash['name'] = name;
		          	hash['display_name'] = alias;
		          	hash['data_type'] = data_type;
		          	hash['options'] = JSON.stringify(options);
		          	hash['default'] = default_value ? default_value : null;
		          	arr.push(hash);	
	          	}          	
	        });
			var uniqueKeyField = $("#file_ds_unique_key_id").val().trim();
          	if(uniqueKeyField){
          		unique_keys.push(uniqueKeyField);
          	}
	        this.get('controller').send('createFieldsArr', arr, unique_keys, ignored_keys);
		}
	}),

	textBoxView: Ember.View.extend({
		template: Ember.Handlebars.compile("<input type='text' {{bindAttr value='view.content'}} /><br>"),

		change: function() {
			var attr = this.get('elementId');
			var value = $(this.get('element')).find("input").val()
			this.get('controller').send('updateGroup', {key: attr, value: value});
		},
	}),

	newDataContentView: Ember.View.extend({
		templateName: 'data_sources/new_content',
		file: null,

		didInsertElement: function() {
			var obj = this;
			var controller = this.get('controller');
			var id = controller.get('id');
			var auth_token = Cibi.Auth.get('authToken');
			var url = '/data_sources/' + id + '/addContent?auth_token=' + auth_token; 
			$("#new-content-form").fileupload({
				url: url,
				add: function(e, data) {
					controller.set('fileUploadFailed', false);
					controller.set('uploadError', false);
					data.submit()
						.success(function(req, msg) {
							controller.set('fileUploadSuccessful', true);		
							controller.get('content').reload();
							controller.get('content').set('field_unique_keys', null);
							// Dirty Hack for making sure selectable jquery plugin is initialized!
							setTimeout(function() {
								obj.get('parentView').rerender();
								controller.set('fileUploadSuccessful', false);		
							}, 1000);
						})
						.error(function(req, msg, err) {
							controller.set('fileUploadFailed', true);
							controller.set('errorMessage', req.responseJSON.message);																	
						})
						.complete(function() {
							controller.set('isAddingContent', false);		
						});

					controller.set('isAddingContent', true);
					setTimeout(function() {
						controller.showProgress();
					}, 3000);
				},
			});
		}.observes('controller.id'),

		
	}),

	selectSheetView: Ember.View.extend({
		templateName: 'data_sources/select_sheet',

		cancelUpload: function() {
			//todo
		},

		sheetsArr: function() {
			return JSON.parse(this.get('controller').get('content').get('sheetsArray'));
		}.property(''),

		submit: function(e) {
			e.preventDefault();
			var obj = this;
			var controller = this.get('controller');

			var sheet_name = this.$('input[name="sheet_name"]:checked').val();
			var data_source = controller.get('content');
			if(data_source.get('dataContents').get('length') == 0){
				data_source.set('fileUploadState',3);
			}else{
				data_source.set('fileUploadState',4);
			}
				
			data_source.get('store').commit();

			$("#modal-select-sheet").modal('toggle');
			$(".modal-backdrop").hide();

			var id = controller.get('id');
			var auth_token = Cibi.Auth.get('authToken');
			var url = '/data_sources/' + id + '/addCachedFileContent?auth_token=' + auth_token; 
	        req = $.ajax({
	            url: url,
	            type: 'post',
	            data: {'sheet_name': sheet_name},
	            async: false,
	            success: function() {
	            	controller.set('fileUploadSuccessful', false);

	            },
	            error: function(req, msg, err) {
	                controller.set('fileUploadFailed', true);
	                controller.set('errorMessage', req.responseJSON.message);		
	            },
	            complete: function() {
	                controller.set('isAddingContent', false);
	            }
	        });
		},
	}),

	dataModelingView: Ember.View.extend({
		templateName: 'data_sources/data_modeling',

		didInsertElement: function(){
			$('#combine_columns').on('keyup', function(){
				if($(this).val() == ''){
					$('#apply-pivot').prop('disabled', true);
				} else {
					$('#apply-pivot').prop('disabled', false);
				}				
			});
		},

		mouseEnter: function(){
		  $(function() {
		    $( "#table th" ).draggable({
		      appendTo: "body",
		      helper: "clone"
		    });
		    $( "#combine_columns" ).droppable({
		      activeClass: "ui-state-default",
		      hoverClass: "ui-state-hover",
		      drop: function( event, ui ) {
		        $( this ).find( ".placeholder" ).remove();
		        if($( "#combine_columns" ).val().trim() == ""){
		        	$( "#combine_columns" ).val(ui.draggable.text());
		        }else{
		        	if($( "#combine_columns" ).val().indexOf(ui.draggable.text()) < 0){
				        var text = $( "#combine_columns" ).val() +',' + ui.draggable.text()
			        	$( "#combine_columns" ).val( text  );
		        	}
		        }
		      }
		    });
		  });
		},

		applyPivot: function(){
			var obj = this;
			var content = this.get('controller').get('content');
			var preview_data = content.get('previewData');
			var fields_data = content.get('fieldsStr');
			var combine_columns = this.$('#combine_columns').val();
			var new_keys_column = this.$('#new_keys_column').val();
			var new_values_column = this.$('#new_values_column').val();
			if(combine_columns == "" || new_keys_column == "" || new_values_column == ""){
				return;
			}
			var auth_token = Cibi.Auth.get('authToken');
			var url_str = '/data_sources/'+ content.get('id') +'/modelPreviewData?auth_token=' + auth_token;
	        req = $.ajax({
	            url: url_str,
	            type: 'post',
	            data: {'combine_columns': combine_columns, 'new_keys_column': new_keys_column,
	        			'new_values_column': new_values_column},
	            async: false,
	            success: function(result) {
					var html = obj.generateHtml(result.data_sources);
					$("#table").html(html);
	            },
	            error: function(req, msg, err) {
		
	            },
	            complete: function() {

	            }
	        });
		},

		generateHtml: function(data_arr) {
			var header = data_arr[0].data_sources;
			var rows = data_arr.slice(1,data_arr.length);
			var html =	'<table class="table table-bordered" >'
			html +=		'<thead>'
			html +=		'<tr>'
					header.forEach(function(h) {
    	            	html += '<th>'+h+'</th>'
   	          		});
			html +=		'</tr>'
			html +=		'</thead>'
			html +=		'<tbody style="">'
					rows.forEach(function(r) {
						html += '<tr>'
						r.data_sources.forEach(function(c) {
							html += '<td>'+c+'</td>'
						});
						html += '</tr>'
					});
			html +=		'</tbody>'
			html +=	'</table>'	
			return html;
		},

		applyRule: function(){
			var obj = this;
			var content = this.get('controller').get('content');
			var combine_columns = this.$('#combine_columns').val();
			var new_keys_column = this.$('#new_keys_column').val();
			var new_values_column = this.$('#new_values_column').val();
			if(combine_columns == "" || new_keys_column == "" || new_values_column == ""){
				content.set('fileUploadState',4);
				content.get('store').commit();
			}else{
				this.get('controller').send('createRule', combine_columns, new_keys_column, new_values_column);	
			} 			
		},

	}),

});
