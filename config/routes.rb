Rails.application.routes.draw do
    get 'class/constraints'
    get 'class/rigidbody'
    get 'class/fluid'

    get '/home', to: 'main#welcome'
    get '/about', to: 'main#about'
    root 'main#welcome'
end
