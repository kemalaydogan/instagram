require 'spec_helper'


describe 'posts index page' do
  context 'no posts' do
     before do 
      login_as_test_user
    end
    it 'shows a message' do
      visit '/posts'
      expect(page).to have_content 'No posts yet'
    end
  end

  describe 'adding posts' do

    before do 
      login_as_test_user
    end

    context 'valid post' do
      it 'is added to the posts page' do
        visit '/posts/new'
        fill_in 'Description', with: 'My holiday pic'
        click_button 'Create Post'

        expect(current_path).to eq '/posts'
        expect(page).to have_content 'My holiday pic'
      end
    end

    context 'invalid post' do
      it 'shows an error' do
        visit '/posts/new'
        click_button 'Create Post'

        expect(page).to have_content 'error'
      end
    end

    describe 'with tags' do

      it "should fill out the tags" do
      visit '/posts/new'
      fill_in 'Description', with: 'My holiday pic'
      fill_in 'Tag names', with: '#yolo, #swag'
      click_button 'Create Post'

      expect(page).to have_content "#yolo"
    end
  end
end

  context 'with posts' do

    before { Post.create(description: 'Some awesome snap') }

    it 'displays the post' do
      visit '/posts'
      expect(page).to have_content 'Some awesome snap'
    end

    it 'displays the post' do
      visit '/posts'
      click_link 'Delete'

      expect(page).not_to have_content 'Some awesome snap'
    end
  end


end