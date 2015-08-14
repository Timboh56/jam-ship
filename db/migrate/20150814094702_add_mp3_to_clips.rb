class AddMp3ToClips < ActiveRecord::Migration
  def change
    add_attachment :clips, :mp3
  end
end
