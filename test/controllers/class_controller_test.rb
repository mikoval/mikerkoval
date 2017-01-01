require 'test_helper'

class ClassControllerTest < ActionController::TestCase
  test "should get constraints" do
    get :constraints
    assert_response :success
  end

  test "should get rigidbody" do
    get :rigidbody
    assert_response :success
  end

  test "should get fluid" do
    get :fluid
    assert_response :success
  end

end
