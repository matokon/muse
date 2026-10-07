class OutfitSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :category, :photo_urls, :clothing_items_count

  def category
    object.category&.as_json(only: [:id, :name])
  end

  def photo_urls
    return [] unless object.photos.attached?

    object.photos.map do |photo|
      Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: true)
    end
  end

  def clothing_items_count
    object.clothing_items.size
  end
end
