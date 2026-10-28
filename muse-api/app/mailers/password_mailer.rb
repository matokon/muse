class PasswordMailer < ApplicationMailer
  default from: ENV.fetch("MAILER_FROM", "Muse <noreply@muse.net.pl>")

  def reset
    @user = params[:user]
    @code = params[:code]
    attachments.inline["muse-logo-no-bg.png"] =
      Rails.root.join("app/assets/muse-logo.png").binread

    mail(to: @user.email, subject: "Kod zmiany hasła w Muse")
  end
end
