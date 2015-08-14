class Clip < ActiveRecord::Base
  belongs_to :user
  belongs_to :channel
  mount_uploader :attachment, ClipUploader
  has_attached_file :uploaded
end