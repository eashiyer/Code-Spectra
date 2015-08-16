Cibi.UserColorPreference = DS.Model.extend({
	colorTheme: DS.attr('number'),
	bar: DS.attr('string'),
	line: DS.attr('string'),
	area: DS.attr('string'),
	errorBar: DS.attr('string'),
	controlKey: DS.attr('string'),	
	statisticalRelevance: DS.attr('string'),
	user: DS.belongsTo('Cibi.User'),

	palette: function() {
		var obj = this;
		var palette = this.getPalette();
		return obj.generateBindAttrArray(palette);
	}.property('colorTheme'),

	getPalette: function() {
		var colorTheme = this.get('colorTheme');
		var colors = this.getColors();
		if(!colorTheme) {
			colorTheme = 0;
		}
		return colors[colorTheme];
	},

	getColors: function() {
		var obj = this;
		var currentUser = Cibi.Auth.get('currentUser');

		return [
			currentUser.getDefaultTheme(),
			["#5458C5", "#C55591","#C55559", "#C58955","#91C555", "#59C555", "#55C589", "#8D55C5", "#BB7D7D", "#BB9C7D",
			"#BBBB7D", "#9CBB7D", "#7DBB9C", "#9B758C", "#9C9875", "#759C98", "#75799C", "#CA5633", "#D3C63E", "#968585"],
			["#DF7777","#AADF76","#76DF76","#76DFAA","#76DFDF","#76AADF","#7676DF","#AA76DF","#A78181","#7A4646","#63232",
			"#11919","#3C57E","#1A268","#BAE4D","#B8535","#CBDAD","#7A87F","#09278","#07371"],
			["#DAC797","#B8DA96","#96DA96","#96DAB8","#96DADA","#96B8DA","#9696DA","#B896DA","#DFCE4F","#DF7777","#5677B1","#8D51BB","#B87A7A","#49B4A2","#D1B2B2","#A6D667","#9FB4A5","#DF89A4","#EBD9A0","#8BB1A3"],
			["#8B8880","#DAC797","#E6C677","#DBB042","#C9B138","#C5A608","#AA8F07","#ADBD99","#A6C97B","#90C74D","#85D425","#69B80A","#518315","#A2A5CA","#848CF8","#5A62CF","#3C46D6","#1F2CD6","#0913A0","#705E30"],
			["#5B8392","#9DB6C3","#CAD9E3","#EEEEEE","#B4CBDE","#EFCE6D","#DAC791","#F7E7BA","#BCE9E9","#85F0F0","#B2CC63","#C4D493","#E2F5AB","#80DA83","#B6E9B7","#E09363","#F8BA93","#AD87D1"],
			["#BA3D25","#E68D45","#D48484","#C75A5A","#FF5050","#BDA7A7","#796D6D","#669B92","#AC9C4F","#68B66F","#7C91B6","#7A5F94","#E75B5B","#DF5688","#67B0D6","#8AD2FC","#8F5E53","#689E6D"],
			["#BC1118","#F82930","#A32C47","#940A2A","#7CB41C","#5E7511","#EC930E","#F1BE46","#F67116","#DAD313","#1FD453","#21C0A0","#4F6BA8","#704EC9","#4AA236","#862C9C","#521C57","#09622A"],
			["#0F0101","#830303","#491313","#351701","#5F2003","#4D3E03","#324102","#1A6603","#055E66","#0646A7","#1D2E85","#4721BF","#8D06C2","#CA04BA","#8D0155","#DA176B","#8B0229","#FF000A"]
		];
	},

	colorThemes: function() {
		var obj = this;
		var themes = obj.getColors();
		themes = _.map(themes, function(t) {
			return obj.generateBindAttrArray(t);
		});
		return themes;
	}.property(''),

	generateBindAttrArray: function(arr) {
		return _.map(arr, function(d) {
			return "background-color: " + d;
		});
	},

	getBarColor: function() {
		var barColor = this.get('bar');
		if(!barColor) {
			barColor = "#0099ff";
		}
		return barColor;
	},

	getLineColor: function() {
		var lineColor = this.get('line');
		if(!lineColor) {
			lineColor = "#ff6633";
		}
		return lineColor;
	},

	getAreaColor: function() {
		var areaColor = this.get('area');
		if(!areaColor) {
			areaColor = "#0099ff";
		}
		return areaColor;
	},

	getErrorBarColor: function() {
		var errorBarColor = this.get('errorBar');
		if(!errorBarColor) {
			errorBarColor = "#999999";
		}
		return errorBarColor;
	},

	getControlKeyColor: function() {
		var controlKeyColor = this.get('controlKey');
		if(!controlKeyColor) {
			controlKeyColor = "#FFFF00";
		}
		return controlKeyColor;
	},	

	getStatisticalRelevanceColor: function() {
		var statisticalRelevanceColor = this.get('statisticalRelevance');
		if(!statisticalRelevanceColor) {
			statisticalRelevanceColor = "#00E600";
		}
		return statisticalRelevanceColor;
	},


});
