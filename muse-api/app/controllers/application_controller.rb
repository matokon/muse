class ApplicationController < ActionController::API
  attr_reader :current_user

  private

  def authenticate_request
    payload = JsonWebToken.decode(bearer_token)
    @current_user = User.find_by(id: payload[:user_id]) if payload

    render json: { errors: [I18n.t("auth.unauthorized")] }, status: :unauthorized unless @current_user
  end

  def bearer_token
    header = request.headers["Authorization"]
    header&.split(" ")&.last
  end
end
