class PasswordMailer < ApplicationMailer
  default from: ENV.fetch("MAILER_FROM", "Muse <noreply@muse.net.pl>")

  def reset
    @user = params[:user]
    @code = params[:code]

    mail(to: @user.email, subject: "Kod zmiany hasła w Muse")
  end
end
