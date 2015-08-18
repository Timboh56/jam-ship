class GenerateSlugsForModels < ActiveRecord::Migration
  def change
    [:channels, :users, :clips].each do |sym|
	add_column sym, :slug, :string, uniq: true
    end
  end
end
