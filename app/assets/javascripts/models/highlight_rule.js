Cibi.HighlightRule = DS.Model.extend({
	comparison_function: DS.attr('string'),
	operator: DS.attr('string'),
	comparison_value: DS.attr('number'),
	configs: DS.attr('string'),
	chart: DS.belongsTo('Cibi.Chart'),
	enable_highlight: DS.attr('boolean'),
	enable_sem:DS.attr('boolean'),

	highlightData: function(originalData, statsData){
		var chart=this.get('chart');
		var highlightRule=this;
		var data=originalData;
		_.each(data,function(d, i){
			d["to_highlight"]=false;
          	d["fill_color"] = null;
			if(d.key==statsData[i].key){
		    // _.each(statsData[i], function(value, key){
		    //   d[key]=value;
		    // });
				if(highlightRule && highlightRule.get('enable_highlight')){
					if(d.key==JSON.parse(highlightRule.get('configs')).control_field){
						d["to_highlight"]=true;
	                  	d["fill_color"] = chart.controlKey();
	                }
	                else{
	                	var significant = statsData[i]["pValue"];
		                if(significant != undefined && significant != "undefined"){
		                  	var isConditionSatisfied=false;
		                  	switch(highlightRule.get('operator')){
			                    case "equal":
			                        if(significant == highlightRule.get('comparison_value')){
			                          isConditionSatisfied=true;
			                        }
			                        break;
			                    case "less than":
			                        if(significant < highlightRule.get('comparison_value')){
			                          isConditionSatisfied=true;
			                        }
			                        break;
			                    case "greater than":
			                        if(significant > highlightRule.get('comparison_value')){
			                          isConditionSatisfied=true;
			                        }
			                        break;
		                  	}
		                  	if(isConditionSatisfied){
			                  	d["to_highlight"]=true;
			                    d["fill_color"] = chart.statisticalRelevance();
		                  	}
		                }
	                }
				}				
		  	}
		});
		return data;
	},
});