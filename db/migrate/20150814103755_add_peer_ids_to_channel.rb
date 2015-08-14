class AddPeerIdsToChannel < ActiveRecord::Migration
  def change
    add_column :channels, :peer_ids, :string, array: true
  end
end
