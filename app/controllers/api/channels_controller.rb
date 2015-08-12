class Api::ChannelsController < ApplicationController
  def destroy
    current_user.channels.find(params[:id]).destroy
    render nothing: true, status: 200
  end
end
