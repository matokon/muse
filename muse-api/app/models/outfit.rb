class Outfit < ApplicationRecord
  belongs_to :user

  has_many :outfit_clothing_items, dependent: :destroy
  has_many :clothing_items, through: :outfit_clothing_items
end
