Rails.application.routes.draw do
    get '/home', to: 'main#welcome'
    get '/about', to: 'main#about'
   root 'main#welcome'
end
