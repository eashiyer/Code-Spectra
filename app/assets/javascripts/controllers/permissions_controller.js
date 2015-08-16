Cibi.PermissionsController = Ember.ArrayController.extend({
	needs: ['users', 'vertical'],

    permissions:function(){
        var permissions=this.filter(function(permission) {
            if(permission.get('isDeleted') || permission.get('user')==Cibi.Auth.get('currentUser'))
                return false;
            else
                return true;
        });
        return permissions;
    }.property('@each.isDeleted', 'length'),

 //    permissionsGroupByUserKeys: function(){
 //        return _.map(this.get('permissionsGroupByUser'), function(value, key){
 //            return key;
 //        });
 //    }.property('@each.isDeleted', 'length'),

	// permissionsGroupByUser: function () {
	// 	var permissions = this.get('permissions');
 //    	var permissions=_.groupBy(permissions,function(s){
 //    		return s.get('user').get('fullName');
 //    	});
 //        return permissions;    	
	// }.property('@each.isDeleted', 'length'),

 //    validPermissions: function(){
 //        var permissions=this.get('permissionsGroupByUser');
 //        var keys= this.get('permissionsGroupByUserKeys');
 //        var arr=[];
 //        for(var i=0;i<keys.length;i++)
 //        {
 //            arr.push(permissions[keys[i]]);
 //        }
 //        return arr;
 //    }.property('@each.isDeleted','length'),
})