class CreateClothingItems < ActiveRecord::Migration[8.1]
  def change
    create_table :clothing_items do |t|
      t.references :user, null: false, foreign_key: true
      t.string :category
      t.string :color
      t.string :name
      t.boolean :is_favourite, default: false, null: false

      t.timestamps
    end
  end
end
