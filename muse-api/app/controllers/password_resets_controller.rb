class PasswordResetsController < ApplicationController
  skip_before_action :authenticate_request
  rate_limit to: 5, within: 1.minute, only: :create

  def create
    user = User.find_by(email: normalized_email)
    PasswordMailer.with(user: user).reset.deliver_later if user

    render json: { message: I18n.t("password_reset.request_accepted") }, status: :accepted
  end

  def update
    user = User.find_by_token_for(:password_reset, params[:token])

    unless user
      return render json: { errors: [ I18n.t("password_reset.invalid_token") ] },
                    status: :unprocessable_entity
    end

    unless passwords_match?
      return render json: { errors: [ I18n.t("password_reset.confirmation_mismatch") ] },
                    status: :unprocessable_entity
    end

    if user.update(password_params)
      render json: { message: I18n.t("password_reset.updated") }, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def normalized_email
    params[:email].to_s.strip.downcase
  end

  def password_params
    params.permit(:password, :password_confirmation)
  end

  def passwords_match?
    params[:password].present? && params[:password] == params[:password_confirmation]
  end
end
