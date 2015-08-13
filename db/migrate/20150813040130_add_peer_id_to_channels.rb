class AddPeerIdToChannels < ActiveRecord::Migration
  def change
    add_column :channels, :peer_id, :string
  end
end
