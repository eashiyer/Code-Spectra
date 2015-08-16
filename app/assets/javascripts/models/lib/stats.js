Cibi.Stats = Ember.Object.create({
	getRelevanceStats: function(arr, control) {
        var control_val, control_mean, control_stddev, control_count, control_sem, control_key_found;		

        arr.forEach(function(d) {
            var regex = new RegExp(control, "gi");
            var control_group = d.key.match(regex);
            if(control_group && control_group.length > 0 ) {
                control_key_found = true;
                control_mean = d.avg;
                control_stddev = d.stddev;
                control_count = d.count;
                control_sem = d.stddev / Math.sqrt(d.count) // d.sem;
                control_val = d.val;
            }
        });
        return {
          	control_key_found: control_key_found,
          	control_stddev: control_stddev,
          	control_mean: control_mean,
          	control_count: control_count,
            control_sem: control_sem,
            control_val: control_val
        };
	},

});