class RemoveNameFromOutfits < ActiveRecord::Migration[8.1]
  def change
    remove_column :outfits, :name, :string if column_exists?(:outfits, :name)
  end
end
