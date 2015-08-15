class Api::ClipsController < ApplicationController
  def create
    @clip = Clip.new(
      user: current_user,
      channel_id: params[:channel_id],
      name: params[:fname],
      mp3: params[:data]
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
