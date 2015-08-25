class Channel < ActiveRecord::Base
  extend FriendlyId

  belongs_to :user
  has_many :clips
  friendly_id :name, use: [:slugged, :finders]
end