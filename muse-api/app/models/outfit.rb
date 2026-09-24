class Outfit < ApplicationRecord
  MAX_PHOTO_SIZE = 10.megabytes
  ALLOWED_PHOTO_TYPES = %w[image/jpeg image/png image/webp image/heic].freeze

  belongs_to :user
  belongs_to :category, optional: true

  has_many :outfit_clothing_items, dependent: :destroy
  has_many :clothing_items, through: :outfit_clothing_items

  has_many_attached :photos

  validate :photos_count
  validate :photos_within_limits

  def as_json(options = {})
    super(options)
      .except('category_id')
      .merge(
        'category' => category&.as_json(only: [:id, :name]),
        'photo_urls' => photo_urls
      )
  end

  def photo_urls
    return [] unless photos.attached?
    photos.map do |p|
      Rails.application.routes.url_helpers.rails_blob_url(p, only_path: true)
    end
  end

  private

  def photos_within_limits
    return unless photos.attached?

    photos.each do |p|
      errors.add(:photos, :invalid_content_type) unless ALLOWED_PHOTO_TYPES.include?(p.blob.content_type)
      errors.add(:photos, :too_large, count: MAX_PHOTO_SIZE / 1.megabyte) if p.blob.byte_size > MAX_PHOTO_SIZE
    end
  end
  
  def photos_count
    return unless photos.attached?
    errors.add(:photos, 'max 5 zdjęć') if photos.length > 5
  end
end