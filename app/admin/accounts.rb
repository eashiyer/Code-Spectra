ActiveAdmin.register Account do
  index do      
  	column :id
    column :name                     
    column :time_limit 
	column :account_type                        
    default_actions                   
  end     
end
