class ClothingItemsController < ApplicationController
  before_action :authenticate_request

  def index
    items = current_user.clothing_items.with_attached_photo
    render json: { items: items.map { |item| item_payload(item) } }
  end

  def create
    item = current_user.clothing_items.new(clothing_item_params)

    if item.save
      render json: { item: item_payload(item) }, status: :created
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    item = current_user.clothing_items.find(params[:id])
    item.destroy

    head :no_content
  end

  private

  def clothing_item_params
    params.permit(:name, :category, :color, :is_favourite, :photo)
  end

  def item_payload(item)
    {
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      is_favourite: item.is_favourite,
      photo_url: item.photo.attached? ? url_for(item.photo) : nil
    }
  end
end
