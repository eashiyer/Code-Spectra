ActiveAdmin.register AuthServer do
  	form do |f|                         
    	f.inputs "User Details" do
      		f.input :account       
      		f.input :auth_server_url
      		f.input :client_name  
    	end                               
   		f.actions
  	end 
end
