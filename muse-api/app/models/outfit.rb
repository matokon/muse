class Outfit < ApplicationRecord
  belongs_to :user
  belongs_to :category, optional: true

  validates :name, presence: true, allow_blank: false

  has_many :outfit_clothing_items, dependent: :destroy
  has_many :clothing_items, through: :outfit_clothing_items

  def as_json(options = {})
    super(options)
      .except('category_id')
      .merge('category' => category&.as_json(only: [:id, :name]))
  end
end
