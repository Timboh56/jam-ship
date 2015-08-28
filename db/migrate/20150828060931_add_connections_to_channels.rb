class AddConnectionsToChannels < ActiveRecord::Migration
  def change
    add_column :channels, :connections, :string, array: true
  end
end
