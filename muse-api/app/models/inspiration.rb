class Inspiration < ApplicationRecord
  MAX_IMAGE_SIZE = 10.megabytes
  ALLOWED_IMAGE_TYPES = %w[image/jpeg image/png image/webp image/heic].freeze

  belongs_to :user
  has_one_attached :image

  validates :caption, presence: true

  validate :image_attached
  validate :image_within_limits

  private

  def image_attached
    errors.add(:image, :blank) unless image.attached?
  end

  def image_within_limits
    return unless image.attached?

    errors.add(:image, :invalid_content_type) unless ALLOWED_IMAGE_TYPES.include?(image.blob.content_type)
    errors.add(:image, :too_large, count: MAX_IMAGE_SIZE / 1.megabyte) if image.blob.byte_size > MAX_IMAGE_SIZE
  end
end
