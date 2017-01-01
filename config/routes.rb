Rails.application.routes.draw do
  get 'webgl/veronoi'
  get 'webgl/torch'

    get 'class/constraints'
    get 'class/rigidbody'
    get 'class/fluid'

    get '/home', to: 'main#welcome'
    get '/about', to: 'main#about'
    root 'main#welcome'
end
