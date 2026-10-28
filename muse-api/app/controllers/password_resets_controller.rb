class PasswordResetsController < ApplicationController
  skip_before_action :authenticate_request
  rate_limit to: 5, within: 1.minute, only: :create, name: "password-reset-request"
  rate_limit to: 5, within: 10.minutes, only: :update, name: "password-reset-update"

  def create
    user = User.find_by(email: normalized_email)

    if user
      code = user.issue_password_reset_code!
      PasswordMailer.with(user: user, code: code).reset.deliver_later
    end

    render json: { message: I18n.t("password_reset.request_accepted") }, status: :accepted
  end

  def update
    user = User.find_by(email: normalized_email)

    unless user&.valid_password_reset_code?(params[:code].to_s)
      return render json: { errors: [ I18n.t("password_reset.invalid_code") ] },
                    status: :unprocessable_entity
    end

    unless passwords_match?
      return render json: { errors: [ I18n.t("password_reset.confirmation_mismatch") ] },
                    status: :unprocessable_entity
    end

    user.assign_attributes(password_params)
    user.password_reset_code_digest = nil
    user.password_reset_code_sent_at = nil

    if user.save
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
