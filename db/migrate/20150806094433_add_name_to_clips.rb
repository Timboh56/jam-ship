class AddNameToClips < ActiveRecord::Migration
  def change
    add_column :clips, :name, :string
  end
end
