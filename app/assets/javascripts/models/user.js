Cibi.User = DS.Model.extend({
	firstName: DS.attr('string'),
	lastName: DS.attr('string'),
	isAdmin: DS.attr('boolean'),
	email: DS.attr('string'),
	userPermissions: DS.attr('string'),
	accountId: DS.attr('number'),
    confirmedAt: DS.attr('date'),
    password:DS.attr('string'),
    passwordConfirmation:DS.attr('string'),
    companyLogoUrl: DS.attr('string'),
    colorPalette: DS.attr('string'),
    hasApiAccess: DS.attr('boolean'),
    authenticationToken: DS.attr('string'),
    apiAccessToken: DS.attr('string'), 
    logoWidth:  DS.attr('number'),
	permissions: DS.hasMany('Cibi.Permission'),
    userFilters: DS.hasMany('Cibi.UserFilter'),
    userColorPreference: DS.belongsTo('Cibi.UserColorPreference'),
    account: DS.belongsTo('Cibi.Account'),
    //accountSetting: DS.belongsTo('Cibi.AccountSetting'),

    init: function() {
        this._super();
        this.get('userColorPreference');
        this.get('account');         
    },

	fullName: function() {
        var first_name = this.get('firstName') || '';
        var last_name = this.get('lastName') || '';
		return first_name + " " + last_name;
	}.property('firstName', 'lastName'),

    get_company_logo_url: function(){
        if(this.get('companyLogoUrl')){
            return this.get('companyLogoUrl')
        }else{
            return "/assets/logo_short.png"
        }
        
    }.property('companyLogoUrl'),

    get_company_logo_width: function(){
        if(this.get('logoWidth')){
            return this.get('logoWidth')
        }        
    }.property('logoWidth'),

    get_top_bar_color: function(){
        if(this.get('colorPalette')){
            var pallet = JSON.parse(this.get('colorPalette'));
            var tbar=pallet['topBarColor'];
            return tbar;
        }
    }.property('colorPalette'), 
    
    get_workspace_color: function(){    
        if(this.get('colorPalette')){
            var pallet = JSON.parse(this.get('colorPalette'));
            var wbar = pallet['workspaceColor'];
            return wbar; 
        }
    }.property('colorPalette'),
    
    get_dashboard_color:function(){    
        if(this.get('colorPalette')){
            var pallet = JSON.parse(this.get('colorPalette'));
            var dbar = pallet['dashboardBarColor'];
            return dbar;
        }
    }.property('colorPalette'),

	permissionsMap: function() {
		var userPermissions = this.get('userPermissions');
		if(userPermissions) {
			return JSON.parse(userPermissions);	
		}
		return [];
	}.property('userPermissions'),

	get_role: function(entity, id) {
		var isAdmin = this.get('isAdmin');
		if(isAdmin) {
			return 'admin';
		}
		var pm = this.get('permissionsMap');
		var authrization = _.filter(pm[entity], function(d) { return d.permissible_id == id})
		if(authrization && authrization.length > 0) {
			return authrization[0].role;
		}
		return false;
	},

    getDefaultTheme: function() {
        var colors = [
            "#0080FF", // 1
            "#87f788",
            "#FF6666",
            "#737fbe",
            "#e072ac",
            "#9476b4",
            "#f7b487",
            "#87b5f7",

            
            "#999999", // 3         
            
            "#A4FA75",
            "#FF9999",
            "#85EEAF",
            "#FFA084",
            "#9582F3",
            "#FF9966"
            ];
        return colors;
    },
	getColors: function() {
        var preference = Cibi.Auth.get('colorPreference');
        var theme;
        if(preference) {
            theme = preference.getPalette();
        } else {
            theme = this.getDefaultTheme();
        }
        
    	var colors = [

    		"#99BDE8",
    		"#89FCF5",
    		"#FFCC99",
    		"#FFCC66",
    		"#EBFF1E",
    		"#CCCC33",
    		"#CCFF66",
    		"#CC9933",
    		"#CC6633",
			"#8DCCD9",

    		
    		"#666666", // 2
    		
    		"#00FF00", // 4
    		"#FF8000", // 5    		
    		"#FF0080", // 6
    		"#9999FF", // 7
    		"#FF99FF", // 8
    		"#00CC33", // 9
    		"#C20AFF", // 10
    		"#CC0099", // 11
    		"#0AC2FF", // 12
    		"#470AFF", // 13
			"#FFFF3D", // 14
			
	   		"#AA4614", // 14
    		"#3A3DB2", // 15
    		"#C5FF14", // 16
    		"#F15352", // 17
    		"#383773", // 18
    		"#734F21", // 19
    		"#F15352", // 20
    		"#BD21F1", // 21
    		"#1C455B", // 22
    		"#AA106B", // 23
    		// 24
    		// 25
    	];
    	return theme.concat(colors) ;
	},

    barColor: function() {
        var preference = Cibi.Auth.get('colorPreference');
        var barColor;
        if(preference) {
            barColor = preference.getBarColor();
        } 
        return barColor;
    },

    lineColor: function() {
        var preference = Cibi.Auth.get('colorPreference');
        var lineColor;
        if(preference) {
            lineColor = preference.getLineColor();
        } 
        return lineColor;
    },

    areaColor: function() {
        var preference = Cibi.Auth.get('colorPreference');
        var areaColor;
        if(preference) {
            areaColor = preference.getAreaColor();
        } 
        return areaColor;
    },

    errorBarColor: function() {
        var preference = Cibi.Auth.get('colorPreference');
        var errorBarColor;
        if(preference) {
            errorBarColor = preference.getErrorBarColor();
        } 
        return errorBarColor;  
    },
    
    controlKeyColor: function() {
        var preference = Cibi.Auth.get('colorPreference');
        var controlKeyColor;
        if(preference) {
            controlKeyColor = preference.getControlKeyColor();
        } 
        return controlKeyColor;        
    },

    statisticalRelevanceColor: function() {
        var preference = Cibi.Auth.get('colorPreference');
        var statisticalRelevanceColor;
        if(preference) {
            statisticalRelevanceColor = preference.getStatisticalRelevanceColor();
        } 
        return statisticalRelevanceColor;         
    }
});