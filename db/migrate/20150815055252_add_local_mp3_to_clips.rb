class AddLocalMp3ToClips < ActiveRecord::Migration
  def change
    add_column :clips, :local_mp3, :string
  end
end
