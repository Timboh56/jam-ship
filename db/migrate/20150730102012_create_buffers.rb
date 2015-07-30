class CreateBuffers < ActiveRecord::Migration
  def change
    create_table :buffers do |t|
      t.json :hash
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
