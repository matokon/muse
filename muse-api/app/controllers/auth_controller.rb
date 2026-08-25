class AuthController < ApplicationController
  def signup
    user = User.new(signup_params)
    if user.save
      render json: { user: user_payload(user), token: JsonWebToken.encode(user_id: user.id) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      render json: { user: user_payload(user), token: JsonWebToken.encode(user_id: user.id) }, status: :ok
    else
      render json: { errors: ["Invalid email or password"] }, status: :unauthorized
    end
  end

  private

  def signup_params
    params.permit(:email, :password, :name)
  end

  def user_payload(user)
    { id: user.id, email: user.email, name: user.name }
  end
end
