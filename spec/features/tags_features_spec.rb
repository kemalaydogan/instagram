describe Tag do

	context 'with post with tags' do

		before do
			create(:post, tag_names: '#yolo#swag')
			create(:post, description: "Hello World")
		end

		describe 'clicking a tag' do
			it 'shows the photos for that tag' do
				visit '/posts'
				click_link '#yolo'
				expect(page).to have_content "Some awesome snap"
			end

			it 'does not show photos without that tag' do
				visit '/posts'
				click_link '#yolo'
				expect(page).not_to have_content "Hello World"
			end
		end
	end
end