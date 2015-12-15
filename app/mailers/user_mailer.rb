class UserMailer < ActionMailer::Base
  default from: "admin@mspectrumsolutions.com"

  def comment_notification(comment, user, recepients, url)
    @user = user
    @comment = comment
    @url = url
    recepient_list = recepients * ";"

    mail(:to => "#{recepient_list}", :subject => "Notification on your report '#{@comment.chart.title}'").deliver
    # mail(:to => "#{recepient_list}", :subject => "Notification on your report '#{@comment.chart.title}'")
  end

  def send_dashboard_report(user, filename, email)
    @user = user
    @filename = filename
    attachments["#{@filename}"] = File.read("#{Rails.root}/public/dashboard_reports/#{@filename}")
    mail(:to => "#{email}", :subject => "Notification on your Dashboard")
  end
end
