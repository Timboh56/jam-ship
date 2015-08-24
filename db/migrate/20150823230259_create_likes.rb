class CreateLikes < ActiveRecord::Migration
  def change
    create_table :likes do |t|
      t.timestamps null: false
      t.references :user
      t.references :likable, polymorphic: true
    end
  end
end
