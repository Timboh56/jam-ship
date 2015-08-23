class Api::ChannelsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def destroy
    current_user.channels.find(params[:id]).destroy
    render nothing: true, status: 200
  end

  def update
    @channel = Channel.friendly.find(params[:id])
    @channel.update_attributes!(channel_params)
    render json: { channel: @channel }, status: 200
  end

  def channel_params
    params.require(:channel).permit(:peer_id, :name)
  end
end
