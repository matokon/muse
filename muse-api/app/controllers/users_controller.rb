class UsersController < ApplicationController
  before_action :authenticate_request

  def me
    render json: { id: current_user.id, email: current_user.email, name: current_user.name }
  end
end
