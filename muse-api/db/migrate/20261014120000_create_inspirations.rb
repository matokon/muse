class CreateInspirations < ActiveRecord::Migration[8.1]
  def change
    create_table :inspirations do |t|
      t.references :user, null: false, foreign_key: true
      t.text :caption, null: false

      t.timestamps
    end
  end
end
