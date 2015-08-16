Cibi::Application.routes.draw do

  resources :dashboard_filters


  devise_for :users, controllers: { sessions: 'sessions', registrations: 'registrations', passwords: 'passwords'} 
  #ActiveAdmin.routes(self)

  devise_scope :user do
    post '/authorize', :to => 'sessions#authorize'
  end  

  get 'home/index'

  # match 'charts/download_csv' => "charts#download_csv"

  unless Rails.env.test?
    root :to => 'home#index'
  end

  resources :accounts do
    collection do
      post "/create_account" => "accounts#create_account"          
    end
  end

  resources :account_settings do
    member do
    end
    collection do
      post "remove_logo" => "account_settings#remove_logo"
      post "upload_logo" => "account_settings#upload_logo"  
    end
  end

  resources :account_templates do
  end
  
  resources :data_sources do
    collection do
      post 'create_data_source'
      post 'data_source_exists'
    end
    member do        
      post 'addContent'
      post 'addCachedFileContent'
      post 'modelPreviewData'
      get 'getUploadProgress'
      post 'clearRedisCache'
      get 'uniqueKeys'
      post 'preview_results'
      post 'create_table'
      post 'add_data'
      get 'getDataContents'
      get 'fetch_data'
    end
  end
  resources :data_contents
  resources :data_connections do
    member do
      post 'test_connection'
    end
  end
  resources :query_data_sources 
  resources :dashboards do
    member do
      post 'download_svg'
      post 'delete_temp_pdf'
    end
  end
  resources :charts do
    member do
      get 'chart_data'
      get "download_csv"
      get "getPreviewData"
      post "update_excluded_rows"
    end
  end

  resources :charts_data_sources do
    member do
      get 'chartData'
      get 'uniqueKeys' 
      get 'rawData'
    end
  end

  resources :verticals
  resources :comments
  resources :permissions
  resources :user_color_preferences

  resources :chart_filters
  resources :user_filters
  
  resources :measures
  resources :dimensions

  resources :highlight_rules

  resources :scheduled_reports

  resources :users

  resources :spree_data_sources 

  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq'  

  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'home#index'
  # mount JasmineRails::Engine => "/specs" unless Rails.env.production?

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
