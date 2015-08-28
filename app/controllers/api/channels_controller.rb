class Api::ChannelsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def destroy
    current_user.channels.find(params[:id]).destroy
    render nothing: true, status: 200
  end

  def update
    @channel = Channel.find(params[:id])
    if params[:connection_id]

      @channel.connections  = if @channel.connections
                                @channel.connections << params[:connection_id]
                              else
                                [params[:connection_id]]
                              end
      session['connection_id'] = params[:connection_id]
      channel_params[:peer_id] = params[:connection_id] if current_user == @channel.user
    end

    @channel.update_attributes!(channel_params)

    render json: { channel: @channel }, status: 200
  end

  def like
    @channel = Channel.find(params[:id])
    @channel.like!(current_user)
    render json: { message: 'Success!', like_count: @channel.likes.count }, status: 200
  rescue Exception => e
    Rails.logger.warn e.message
    render json: { message: 'Success!' }, status: 420
  end

  def dislike
    @channel = Channel.find(params[:id])
    @channel.dislike!(current_user)
    render json: { message: 'Success!', like_count: @channel.likes.count }, status: 200
  rescue Exception => e
    Rails.logger.warn e.message
    render json: { message: 'Success!' }, status: 420
  end

  def channel_params
    params.require(:channel).permit(:peer_id, :name) rescue {}
  end
end
