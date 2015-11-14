ActionMailer::Base.smtp_settings = {
  :address              => "smtp.1and1.com",
  :port                 => "25",
  :domain               => "1and1.com",
  :user_name            => "phuong@mspectrumsolutions.com",
  :password             => "hochiminh",
  :authentication       => "login",
  :enable_starttls_auto => true
}

# ActionMailer::Base.smtp_settings = {
#     :address              => "smtp.gmail.com",
#     :port                 => 587,
#     :domain               => "gmail.com",
#     :user_name            => "techlooperbyvnw@gmail.com",
#     :password             => "waiting2212",
#     :authentication       => "plain",
#     :enable_starttls_auto => true
# }

ActionMailer::Base.delivery_method = :smtp
# ActionMailer::Base.smtp_settings = {
#     :address              => "smtp.1and1.com",
#     :port                 => 587,
#     :domain               => "cerebrateinc.com",
#     :user_name            => "mahesh@cerebrateinc.com",
#     :password             => "MaheshPass#1",
#     :authentication       => "plain",
#     :enable_starttls_auto => true
# }

#"localhost:3000"
Mail.register_interceptor(DevelopmentMailInterceptor)
# Mail.register_interceptor(DevelopmentMailInterceptor) if Rails.env.development?