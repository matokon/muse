class Outfit < ApplicationRecord
  MAX_PHOTO_SIZE = 10.megabytes
  ALLOWED_PHOTO_TYPES = %w[image/jpeg image/png image/webp image/heic].freeze

  belongs_to :user
  belongs_to :category, optional: true

  has_many :outfit_clothing_items, dependent: :destroy
  has_many :clothing_items, through: :outfit_clothing_items

  has_one_attached :photo

  validate :photo_within_limits

  def as_json(options = {})
    super(options)
      .except('category_id')
      .merge(
        'category' => category&.as_json(only: [:id, :name]),
        'photo_url' => photo_url
      )
  end

  def photo_url
    return nil unless photo.attached?
    Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: true)
  end

  private

  def photo_within_limits
    return unless photo.attached?

    errors.add(:photo, :invalid_content_type) unless ALLOWED_PHOTO_TYPES.include?(photo.blob.content_type)
    errors.add(:photo, :too_large, count: MAX_PHOTO_SIZE / 1.megabyte) if photo.blob.byte_size > MAX_PHOTO_SIZE
  end
end