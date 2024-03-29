require 'spec_helper'

describe 'Uploading photos' do 

	before do 
      login_as_test_user
    end
    
	it 'displayed the image on the post page' do
		visit '/posts/new'
		fill_in 'Description', with: 'My holiday pic'
		attach_file 'Picture', Rails.root.join('spec/images/old-man.jpg')
		click_button 'Create Post'

		expect(page).to have_css 'img.uploaded-pic'
	end
end