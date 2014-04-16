class Post < ActiveRecord::Base
	validates :description, presence: true

	has_attached_file :picture, :styles => { :medium => "300x300>", :thumb => "100x100>" }
	validates_attachment_content_type :picture, content_type: ["image/jpg", "image/jpeg", "image/png"]

	has_and_belongs_to_many :tags 

	def tag_names
		tags.map(&:name).join
	end

	def tag_names=(tag_names)
		tag_names.split(' ').uniq.each do |tag_name|
			tag = Tag.find_or_create_by(name: tag_name)
			self.tags << tag
		end
	end

end
