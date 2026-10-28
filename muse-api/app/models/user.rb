class User < ApplicationRecord
  PASSWORD_RESET_CODE_EXPIRY = 10.minutes

  has_secure_password

  has_many :outfits, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :clothing_items, dependent: :destroy
  has_many :inspirations, dependent: :destroy
  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true

  def issue_password_reset_code!
    code = SecureRandom.random_number(1_000_000).to_s.rjust(6, "0")

    update!(
      password_reset_code_digest: BCrypt::Password.create(code),
      password_reset_code_sent_at: Time.current
    )

    code
  end

  def valid_password_reset_code?(code)
    return false if code.blank? || password_reset_code_digest.blank? || password_reset_code_sent_at.blank?
    return false if password_reset_code_sent_at < PASSWORD_RESET_CODE_EXPIRY.ago

    BCrypt::Password.new(password_reset_code_digest).is_password?(code)
  rescue BCrypt::Errors::InvalidHash
    false
  end
end
