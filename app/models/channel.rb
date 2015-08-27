class Channel < ActiveRecord::Base
  extend FriendlyId
  belongs_to :user
  has_many :likes, as: :likable
  has_many :clips
  delegate :avatar, to: :user
  friendly_id :name, use: [:slugged, :finders]

  def like!(user)
    likes.create!(user: user)
  end

  def dislike!(user)
    likes.where(user: user).first.destroy!
  end
end