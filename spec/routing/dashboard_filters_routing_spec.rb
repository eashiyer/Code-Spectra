require "spec_helper"

describe DashboardFiltersController do
  describe "routing" do

    it "routes to #index" do
      get("/dashboard_filters").should route_to("dashboard_filters#index")
    end

    it "routes to #new" do
      get("/dashboard_filters/new").should route_to("dashboard_filters#new")
    end

    it "routes to #show" do
      get("/dashboard_filters/1").should route_to("dashboard_filters#show", :id => "1")
    end

    it "routes to #edit" do
      get("/dashboard_filters/1/edit").should route_to("dashboard_filters#edit", :id => "1")
    end

    it "routes to #create" do
      post("/dashboard_filters").should route_to("dashboard_filters#create")
    end

    it "routes to #update" do
      put("/dashboard_filters/1").should route_to("dashboard_filters#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/dashboard_filters/1").should route_to("dashboard_filters#destroy", :id => "1")
    end

  end
end
