require 'test_helper'

class WebglControllerTest < ActionController::TestCase
  test "should get veronoi" do
    get :veronoi
    assert_response :success
  end

end
