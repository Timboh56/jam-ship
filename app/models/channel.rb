class Channel < ActiveRecord::Base
  belongs_to :user
  has_many :clips
end
