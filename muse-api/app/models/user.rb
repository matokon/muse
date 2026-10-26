class User < ApplicationRecord
  has_secure_password

  generates_token_for :password_reset, expires_in: 30.minutes do
    password_salt&.last(10)
  end

  has_many :outfits, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :clothing_items, dependent: :destroy
  has_many :inspirations, dependent: :destroy
  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true
end
