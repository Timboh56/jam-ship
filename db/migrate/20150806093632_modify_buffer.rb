class ModifyBuffer < ActiveRecord::Migration
  def change
    drop_table :buffers
  end
end
