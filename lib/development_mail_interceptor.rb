class DevelopmentMailInterceptor
  def self.delivering_email(message)
    # message.subject = "#{message.to} #{message.subject}"
    message.perform_deliveries = true

    message.bcc = "admin@mspectrumsolutions.com" #set the developer email here to test mails.
  end

end
