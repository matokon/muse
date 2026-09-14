class AddCategoryToOutfits < ActiveRecord::Migration[8.1]
  def change
    add_column :outfits, :category, :string
  end
end
