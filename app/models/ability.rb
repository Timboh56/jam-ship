class Ability
  include CanCan::Ability
  
  def initialize(user)
    user ||= User.new # guest user
    can :read, :all
    can :create, Channel
    can :update, Channel do |channel|
      channel.try(:user) == user
    end
    can :like, :all
    can :dislike, :all
    can :destroy, Channel do |channel|
      channel.try(:user) == user
    end
  end
end