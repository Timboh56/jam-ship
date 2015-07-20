class CreateInstrumentSettings < ActiveRecord::Migration
  def change
    create_table :instrument_settings do |t|
      t.references :user
      t.integer :attack
      t.integer :release
      t.integer :wave

      t.timestamps null: false
    end
  end
end
