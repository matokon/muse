class PasswordMailer < ApplicationMailer
  default from: ENV.fetch("MAILER_FROM", "Muse <onboarding@resend.dev>")

  def reset
    @user = params[:user]
    @token = @user.generate_token_for(:password_reset)
    query = { token: @token }.to_query
    @reset_url = "#{reset_url_base}?#{query}"

    mail(to: @user.email, subject: "Zmień hasło w Muse")
  end

  private

  def reset_url_base
    ENV.fetch("PASSWORD_RESET_URL", "museapp://reset-password")
  end
end
