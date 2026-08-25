class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base
  DEFAULT_EXPIRY = 24.hours

  def self.encode(payload, exp = DEFAULT_EXPIRY.from_now)
    JWT.encode(payload.merge(exp: exp.to_i), SECRET_KEY)
  end

  def self.decode(token)
    payload = JWT.decode(token, SECRET_KEY).first
    ActiveSupport::HashWithIndifferentAccess.new(payload)
  rescue JWT::DecodeError
    nil
  end
end
