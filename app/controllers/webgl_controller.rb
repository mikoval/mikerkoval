class WebglController < ApplicationController
  def veronoi
   render(:layout => "layouts/webgl")
  end
  def torch
   render(:layout => "layouts/webgl")
  end
end
