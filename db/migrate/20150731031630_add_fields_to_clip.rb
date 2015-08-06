class AddFieldsToClip < ActiveRecord::Migration
  def change
    add_column :clips, :attachment, :string
    add_reference :clips, :user
  end
end
