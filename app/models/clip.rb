class Clip < ActiveRecord::Base
  belongs_to :user
  belongs_to :channel
  mount_uploader :attachment, ClipUploader
end