require 'test_helper'

class RaytracerControllerTest < ActionController::TestCase
  test "should get primitives" do
    get :primitives
    assert_response :success
  end

end
