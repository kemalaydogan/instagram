require 'spec_helper'

describe Post do
	context 'validations' do
		let(:post) { Post.new }

		specify 'description is required' do
			expect(post).to have(1).errors_on(:description)
		end

		describe '#tag_names' do
			it 'should create a tag if it does not exist' do
				post = create(:post, tag_names:'#makersswag #yolo')
				expect(post.tags.count).to eq 2
				expect(post.tags.first.name).to eq "#makersswag"
			end

			it 'should create a tag if it does not exist' do
				post = create(:post, tag_names:'#makersswag')
				expect(post.tags.count).to eq 1
				expect(post.tags.first.name).to eq "#makersswag"
			end

			it 'should use the tag if it already exists' do
				tag = Tag.create(name: '#swag')
				post = create(:post, tag_names:'#swag')

				expect(post.tags.count).to eq 1
				expect(post.tags.first.name).to eq '#swag'
				expect(Tag.count).to eq 1
			end

			it 'should keep tags unique' do
				post = create(:post, tag_names:'#swag #yolo #swag')

				expect(post.tags.count).to eq 2
			end
		end
	end

end

