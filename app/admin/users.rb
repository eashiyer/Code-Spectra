ActiveAdmin.register User do
  index do      
  	column :id
    column :email                     
    column :current_sign_in_at        
    column :last_sign_in_at           
    column :sign_in_count             
    default_actions                   
  end

  form do |f|                         
    f.inputs "User Details" do
      f.input :account
      f.input :email
      f.input :first_name
      f.input :last_name                  
      f.input :password
      f.input :password_confirmation
      f.input :confirmed_at
      f.input :is_admin, :as => :radio
    end                               
    f.actions                         
  end      
end
