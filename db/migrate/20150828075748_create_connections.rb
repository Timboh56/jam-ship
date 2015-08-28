class CreateConnections < ActiveRecord::Migration
  def change
    create_table :connections do |t|
      t.references :user
      t.references :channel
      t.string :peer_id
      t.timestamps null: false
    end
    add_index :connections, [:user_id, :channel_id]
  end
end
