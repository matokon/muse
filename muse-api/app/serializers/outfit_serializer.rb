class OutfitSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :category, :photos, :photo_urls, :clothing_items_count

  def category
    object.category&.as_json(only: [:id, :name])
  end

  def photo_urls
    photos.map { |photo| photo[:url] }
  end

  def photos
    object.photos.map do |photo|
      {
        id: photo.id,
        url: Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: true)
      }
    end
  end

  def clothing_items_count
    object.clothing_items.size
  end
end
