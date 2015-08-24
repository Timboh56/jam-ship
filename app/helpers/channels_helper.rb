module ChannelsHelper
  def current_user_logged_in?
    !current_user.new_record?
  end
end
