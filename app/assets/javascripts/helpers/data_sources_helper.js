Ember.Handlebars.helper('fieldname', function(field, options) {
  var name = field['name'];
  return name;
});

Ember.Handlebars.helper('datatype', function(field, options) {
  //var name = Object.keys(field)[0];
  if(field['data_type'] == 'varchar'){
  	data_type = field['data_type']+'('+JSON.parse(field['options'])['string_length']+')';
  }else if(field['data_type'] == 'decimal'){
  	data_type = field['data_type']+'('+JSON.parse(field['options'])['max_digits']+','+JSON.parse(field['options'])['max_decimals']+')';
  }else if(field['data_type'] == 'date'){
    data_type = field['data_type']+'('+JSON.parse(field['options'])['date_format']+')';
  }else if(field['data_type'] == 'time'){
    data_type = field['data_type']+'('+JSON.parse(field['options'])['time_format']+')';
  }else if(field['data_type'] == 'datetime'){
     data_type = field['data_type']+'('+JSON.parse(field['options'])['date_format']+' '+ JSON.parse(field['options'])['time_format']+')';
  }else{
  	data_type = field['data_type']
  }
  var datatype = data_type;
  return datatype;
});

Ember.Handlebars.helper('alias', function(field, options) {
  return field['display_name'];
});

Ember.Handlebars.helper('default_value', function(field, options) {
  return field['default'];
});
