Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  post "signup" => "auth#signup"
  post "login"  => "auth#login"
  post "password_resets" => "password_resets#create", as: :password_resets
  patch "password_resets" => "password_resets#update", as: :password_reset
  get  "me"     => "users#me"
  delete "me"   => "users#destroy"

  resources :clothing_items, only: [:index, :show, :create, :update, :destroy]
  resources :outfits, only: [ :index, :show, :create, :update, :destroy ] do
    delete "photos/:photo_id", action: :destroy_photo, on: :member
  end
  resources :categories,     only: [:index, :create, :destroy]
  resources :inspirations,   only: [ :index, :create, :destroy ]
end
