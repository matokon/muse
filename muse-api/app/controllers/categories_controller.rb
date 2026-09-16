class CategoriesController < ApplicationController
  before_action :set_category, only: [:update, :destroy]

  def index
    categories = current_user.categories.left_joins(:outfits).group(:id).select('categories.*, COUNT(outfits.id) AS outfits_count')

    render json: categories.map { |c|
      { id: c.id, name: c.name, outfits_count: c.outfits_count }
    }
  end

  def create
    category = current_user.categories.new(category_params)

    if category.save
      render json: { category: category }, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @category.destroy
      head :no_content
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_category
    @category = current_user.categories.find_by(id: params[:id])
    render json: { errors: ['Nie znaleziono kategorii'] }, status: :not_found unless @category
  end

  def category_params
    params.require(:category).permit(:name)
  end
end