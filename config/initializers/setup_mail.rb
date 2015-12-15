ActionMailer::Base.smtp_settings = {
    :address              => "smtp.1and1.com",
    :port                 => 587,
    :user_name            => "admin@mspectrumsolutions.com",
    :password             => "mailPass#1",
    :authentication       => "login",
    :enable_starttls_auto => true
}

#"localhost:3000"
Mail.register_interceptor(DevelopmentMailInterceptor)
#Mail.register_interceptor(DevelopmentMailInterceptor) if Rails.env.development?