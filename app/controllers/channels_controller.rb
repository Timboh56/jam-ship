class ChannelsController < ApplicationController
  before_action :authenticate_user!, except: [:show, :index]

  def show
    @channel = Channel.friendly.find(params[:id])
    @connection_id = @channel.connections.where(user: current_user).first.peer_id rescue nil

    # need to write algorithm to clear 
    # guest connection ids after certain amount of time
  end

  def index
    @channels = Channel.all.limit(50)
  end

  def create
    channel = Channel.create!(channel_params.merge!({ user: current_user }))
    redirect_to channel_path(channel)
  end

  def destroy
    @channel = Channel.friendly_id.find(params[:id])
    authorize! :destroy, @channel
    @channel.destroy
    redirect_to channels_path
  end

  def channel_params
    params.require(:channel).permit(:name)
  end
end
