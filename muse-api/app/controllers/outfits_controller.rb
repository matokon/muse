class OutfitsController < ApplicationController
  def categories
    categories = Outfit.group(:category).count

    render json: categories.map { |category, count|
      {
        category: category,
        outfits_count: count
      }
    }
  end
end
