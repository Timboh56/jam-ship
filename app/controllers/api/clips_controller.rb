class Api::ClipsController < ApplicationController
  before_action :authenticate_user!

  def create
    @clip = Clip.create!(
      user: current_user,
      channel_id: params[:channel_id],
      name: params[:fname],
      local_mp3: params[:data]
    )

    render json: { clip_id: @clip.id, url: @clip.mp3.url }, status: 200
  end

  def destroy
    Clip.find(params[:id]).destroy!
    render json: { message: 'Success!' }, status: 200
  end

  def clip_params
    params.permit(:fname, :data)
  end
end
