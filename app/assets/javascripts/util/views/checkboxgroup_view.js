Cibi.CheckboxGroupView = Em.Checkbox.extend({
	checkedObserver: (function() {
		var checkedVal = this.get('checkedVal');
		var selectedArr = this.get('selectedArr');
		
		if(this.get('checked')) {
			selectedArr.pushObject(checkedVal);
		} else {
			selectedArr.removeObject(checkedVal);
		}
		
	}).observes('checked'),

});