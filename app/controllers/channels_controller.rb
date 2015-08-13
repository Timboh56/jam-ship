class ChannelsController < ApplicationController
  before_action :authenticate_user!

  def show
    @channel = Channel.find(params[:id])
  end

  def index
    @channels = Channel.all.limit(50)
  end

  def create
    channel = Channel.create!(channel_params.merge!({ user: current_user }))
    redirect_to channel_path(channel)
  end

  def channel_params
    params.require(:channel).permit(:name)
  end
end
