class BuffersController < ApplicationController
  def index

  end

  def create
    binding.pry
    Buffer.create!(params[:buffer][:hash])
  end
end
