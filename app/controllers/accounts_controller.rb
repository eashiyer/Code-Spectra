class AccountsController < ApplicationController
	def create_account
		accountCreated = Account.create_account(params)
		if accountCreated
			render :json => {'message' => 'Account created successfully'}, status: 200
		else
			render :json => {:error => 'Unable to save'}, status:422
		end
	end

	# def show
	#     @account = Account.find(params[:id])
	# 	render :json => @accounts
	# end

	def index

	end

	def show
        @account_setting = Account.find params[:id]
        render :json => @account_setting
	end

	def create
	
	end

	  def update
	    @account = Account.find(params[:id])
	   	if params[:account][:account_setting_id]
	   		params[:account].delete(:account_setting_id)
	   	end
	    respond_to do |format|
	      if @account.update_attributes(params[:account])
	        format.html { redirect_to @account, notice: 'Account was successfully updated.' }
	        format.json { head :no_content }
	      else
	        format.html { render action: "edit" }
	        format.json { render json: @account.errors, status: :unprocessable_entity }
	      end
	    end
	  end

	def destroy

	end	

end