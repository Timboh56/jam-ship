class Api::ClipsController < ApplicationController
  def create
    Clip.create!(user: current_user, name: params[:fname], attachment: params[:data])
    render nothing: true, status: 200
  end

  def destroy
    Clip.find(params[:id]).destroy!
  end

  def clip_params
    params.permit(:fname, :data)
  end
end
