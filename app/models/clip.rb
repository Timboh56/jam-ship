class Clip < ActiveRecord::Base
  belongs_to :user
  belongs_to :channel
  mount_uploader :attachment, ClipUploader

  has_attached_file :mp3,
    :storage => :s3,
    :s3_credentials => "#{Rails.root}/config/s3.yml",
    :path => "sounds/:id/:style.:extension",
    :url => ":s3_domain_url",
    :s3_host_name => "s3-website-us-west-1.amazonaws.com"
  process_in_background :mp3

  #before_validation :convert_to_mp3
  validates_attachment :mp3, content_type: { content_type: ["audio/wav", "mp3"] }

  def reconvert_to_mp3
    wavfile = Tempfile.new(".wav")
    wavfile.binmode

    open(wav.url) do |f|
      wavfile << f.read
    end

    wavfile.close

    convert_tempfile(wavfile)
  end

  def convert_to_mp3
    tempfile = mp3.queued_for_write[:original]
    unless tempfile.nil?
      convert_tempfile(tempfile)
    end
  end

  def convert_tempfile(tempfile)
    dst = Tempfile.new(".mp3")

    cmd_args = [File.expand_path(tempfile.path), File.expand_path(dst.path)]
    system("lame", *cmd_args)

    dst.binmode
    io = StringIO.new(dst.read)
    dst.close
    self.mp3 = io
  end
end