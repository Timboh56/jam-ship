class AddLocalMp3ToClips < ActiveRecord::Migration
  def change
    add_attachment :clips, :local_mp3
  end
end
