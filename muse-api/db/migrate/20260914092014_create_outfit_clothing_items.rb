class CreateOutfitClothingItems < ActiveRecord::Migration[8.1]
  def change
    create_table :outfit_clothing_items do |t|
      t.references :outfit, null: false, foreign_key: true
      t.references :clothing_item, null: false, foreign_key: true

      t.timestamps
    end

    add_index :outfit_clothing_items,
              [:outfit_id, :clothing_item_id],
              unique: true
  end
end
