class ClipUploadJob < ActiveJob::Base
  queue_as :default

  def perform(*args)
    clip = Clip.find(args[0])
    clip.upload_to_s3
    clip.local_clip.destroy
  end
end
