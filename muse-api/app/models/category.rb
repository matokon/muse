class Category < ApplicationRecord
  belongs_to :user
  has_many :outfits, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { scope: :user_id }
end