class GamesController < ApplicationController
  def minesweeper
   render(:layout => "layouts/webgl")
  end
  def tictactoe
   render(:layout => "layouts/webgl")
  end
  def connect4
   render(:layout => "layouts/webgl")
  end
end
