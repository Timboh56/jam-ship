class AddChannelReferenceToClips < ActiveRecord::Migration
  def change
    add_reference :clips, :channel
  end
end
