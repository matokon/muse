class DropColorAddNoteToClothingItems < ActiveRecord::Migration[8.1]
  def change
    remove_column :clothing_items, :color, :string
    add_column :clothing_items, :note, :text
  end
end
