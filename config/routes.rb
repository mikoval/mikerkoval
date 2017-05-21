Rails.application.routes.draw do
  get 'raytracer/primitives'
  get 'raytracer/meshes'
  get 'raytracer/scenes'
   get 'raytracer/noise'
  get 'webgl/veronoi'
  get 'webgl/torch'
  get 'webgl/repel'
  get 'webgl/rain'

    get 'class/constraints'
    get 'class/rigidbody'
    get 'class/fluid'

    get '/home', to: 'main#welcome'
    get '/about', to: 'main#about'

    get 'simulation/diffusion'
    get 'games/minesweeper'
    root 'main#welcome'
end
