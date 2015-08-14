class AddMp3ToClips < ActiveRecord::Migration
  def change
    add_column :clips, :mp3, :string
  end
end
