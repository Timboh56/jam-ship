class ClipUploadJob < ActiveJob::Base
  queue_as :default

  def perform(*args)
    Clip.find(args[0]).upload
  end
end
