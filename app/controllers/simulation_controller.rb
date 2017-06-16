class SimulationController < ApplicationController
  def diffusion
   render(:layout => "layouts/webgl")
  end
  def balloons
   render(:layout => "layouts/webgl")
  end
end
