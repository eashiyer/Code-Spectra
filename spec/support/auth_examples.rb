shared_examples 'http code' do |code|
  it "returns http #{code}" do
    response.response_code.should == code
  end
end

shared_examples 'auth response' do
  context 'remember me on' do
    it 'auth response case' do @remember = true end
  end

  context 'remember me off' do
    it 'auth response case' do @remember = false end
  end

  context 'remember me unspecified' do
    it 'auth response case' do @remember = nil end
  end
end

shared_examples 'auth response case' do
  before do
    if [true, false].include? @remember
      params[:remember] = remember
    end
    post 'create', params
  end
  subject { JSON.parse response.body }

  it { should include 'user_id' }
  it { should include 'auth_token' }
  it do
    if remember
      should include 'remember_token'
    else
      should_not include 'remember_token'
    end
  end

  it 'http code', 201
end