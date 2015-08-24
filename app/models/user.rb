class User < ActiveRecord::Base
  require "open-uri"
  extend FriendlyId

  has_many :channels, dependent: :destroy
  has_many :clips, dependent: :destroy
  has_many :likes, as: :likable, dependent: :destroy
  friendly_id :name, use: :slugged
  TEMP_EMAIL_PREFIX = 'change@me'
  TEMP_EMAIL_REGEX = /\Achange@me/

  # Include default devise modules. Others available are:
  # :lockable, :timeoutable
  devise :database_authenticatable, :registerable,
    :recoverable, :rememberable, :trackable, :validatable, :omniauthable, omniauth_providers: [ :facebook, :twitter ]

  validates_format_of :email, :without => TEMP_EMAIL_REGEX, on: :update
  has_attached_file :avatar, styles: { medium: "300x300>", thumb: "100x100>" }, default_url: "/images/:style/missing.png"
  validates_attachment_content_type :avatar, content_type: /\Aimage\/.*\Z/

  def full_name
    name || 'No name'
  end

  def likes_channel(channel_id)
    like_ids.include? channel_id
  end

  def download_profile_pic(url)
    begin
      io = open(URI.parse(url))
      test = url.path.split('/').last.blank?
      self.avatar = test ? nil : url  
    rescue Exception => e
      Rails.logger.error e.message
      self.avatar = nil
    end
  end

  def self.find_for_oauth(auth, signed_in_resource = nil)

    # Get the identity and user if they exist
    identity = Identity.find_for_oauth(auth)

    user = signed_in_resource ? signed_in_resource : identity.user

    # Create the user if needed
    if user.nil?

      email_is_verified = auth.info.email && (auth.info.verified || auth.info.verified_email)
      email = auth.info.email if email_is_verified
      user = User.where(:email => email).first if email

      # Create the user if it's a new registration
      if user.nil?
        user = User.new(
          name: auth.extra.raw_info.name,
          #username: auth.info.nickname || auth.uid,
          email: email ? email : "#{TEMP_EMAIL_PREFIX}-#{auth.uid}-#{auth.provider}.com",
          password: Devise.friendly_token[0,20],
        )
        user.download_profile_pic(auth.info.image)
        user.save!
      end
    end

    if identity.user != user
      identity.user = user
      identity.save!
    end
    user
  end

  def email_verified?
    self.email && self.email !~ TEMP_EMAIL_REGEX
  end
end