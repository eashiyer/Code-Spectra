/**
@class Cibi.Permission
*/

/**
  `Cibi.Permission` is the `Permission` model

  A permission has following attributes: 

  `role, user_id, permissible_type, permission_id`

  In addition, a permission has following relationships:

  belongs_to user
  belongs_to permissible # Polymorphic => Dashboard, Vertical
  
  @class Cibi.Permission
*/
Cibi.Permission = DS.Model.extend({
	role: DS.attr('string'),
  permissibleType: DS.attr('string'),
  permissibleId: DS.attr('number'),
	user: DS.belongsTo('Cibi.User'),
	
  userName: function() {
    var user = this.get('user');
    if(user) {
      return user.get('firstName') + " " + user.get('lastName');  
    }
  }.property('user'),

  userPermissions: function(){
    var user=this.get('user');
  }.property('user'),

  entityName: function(){
    var type=this.get('permissibleType');
    if(type=="Vertical")
    {
      var vertical=Cibi.Vertical.find(this.get('permissibleId'));
      return ("Entire Vertical");
    }
    else if(type=="Dashboard")
    {
      var dashboard=Cibi.Dashboard.find(this.get('permissibleId'));
      return dashboard.get('displayName');
    }
  }.property('permissibleType', 'permissibleId','user'),
});