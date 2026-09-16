class OutfitsController < ApplicationController
  before_action :set_outfit, only: [:show, :update, :destroy]

  def index
    outfits = current_user.outfits.order(created_at: :desc)
    outfits = outfits.where(category_id: params[:category_id]) if params[:category_id].present?
    render json: { outfits: outfits }
  end

  def show
    render json: {
      outfit: @outfit,
      clothing_items: @outfit.clothing_items.as_json(
        only: [:id, :name],
        methods: [:photo_url]
      )
    }
  end

  def create
    outfit = current_user.outfits.new(outfit_params)

    if outfit.save
      render json: { outfit: outfit }, status: :created
    else
      render json: { errors: outfit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @outfit.update(outfit_params)
      render json: { outfit: @outfit }
    else
      render json: { errors: @outfit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @outfit.destroy
    head :no_content
  end

  private

  def set_outfit
    @outfit = current_user.outfits.find_by(id: params[:id])

    unless @outfit
      render json: { errors: ['Nie znaleziono outfitu'] }, status: :not_found
    end
  end

  def outfit_params
    attrs = params.require(:outfit).permit(:name, :category_id, :clothing_item_ids => [])

    if attrs.key?(:category_id)
      attrs[:category_id] = safe_category_id(attrs[:category_id])
    end

    if attrs.key?(:clothing_item_ids)
      attrs[:clothing_item_ids] = safe_clothing_item_ids(attrs[:clothing_item_ids])
    end

    attrs
  end

  def safe_category_id(id)
    current_user.categories.where(id: id).pick(:id)
  end

  def safe_clothing_item_ids(ids)
    current_user.clothing_items.where(id: ids).pluck(:id)
  end
end