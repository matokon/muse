class AddPasswordResetCodeToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :password_reset_code_digest, :string
    add_column :users, :password_reset_code_sent_at, :datetime
  end
end
