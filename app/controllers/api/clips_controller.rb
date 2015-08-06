class Api::ClipsController < ApplicationController
  def create
    Clip.create!(name: params[:fname], attachment: params[:data])
    render nothing: true, status: 200
  end
end
