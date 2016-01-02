class DummyAuthServerController < ApplicationController
  def authen
    data = {
      email: "web@spectra.com",
      expires_in: 5000
    }
    render json: data, status: 200
  end
end