class ClothingItem < ApplicationRecord
  MAX_PHOTO_SIZE = 5.megabytes
  ALLOWED_PHOTO_TYPES = %w[image/jpeg image/png image/webp image/heic].freeze

  has_one_attached :photo

  belongs_to :user

  validates :name, presence: true

  validate :photo_within_limits

  private

  def photo_within_limits
    return unless photo.attached?

    errors.add(:photo, :invalid_content_type) unless ALLOWED_PHOTO_TYPES.include?(photo.blob.content_type)
    errors.add(:photo, :too_large, count: MAX_PHOTO_SIZE / 1.megabyte) if photo.blob.byte_size > MAX_PHOTO_SIZE
  end
end
