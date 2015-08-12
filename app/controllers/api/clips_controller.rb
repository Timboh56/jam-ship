class Api::ClipsController < ApplicationController
  def create
    @clip = Clip.create!(user: current_user, channel_id: params[:channel_id], name: params[:fname], attachment: params[:data])
    render json: { clip_id: @clip.id, url: @clip.attachment.url }, status: 200
  end

  def destroy
    Clip.find(params[:id]).destroy!
    render nothing: true, status: 200
  end

  def clip_params
    params.permit(:fname, :data)
  end
end
