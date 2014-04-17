class Post < ActiveRecord::Base
	validates :description, presence: true

	has_attached_file :picture, :styles => { :medium => "300x300>", :thumb => "100x100>", :large => "550x550"},
	storage: :s3,
  bucket: 'bonobospics',
  s3_credentials: {
    access_key_id: Rails.application.secrets.s3_access_key,
    secret_access_key: Rails.application.secrets.s3_secret_key
   }
	validates_attachment_content_type :picture, content_type: ["image/jpg", "image/jpeg", "image/png"]

	has_and_belongs_to_many :tags 
	has_many :comments

	def tag_names
		tags.map(&:name).join
	end

	def tag_names=(tag_names)
		self.tags = tag_names.split(' ').uniq.map do |tag_name|
			tag_name.prepend("#") unless tag_name[0] == "#"
			Tag.find_or_create_by(name: tag_name.downcase)
		end
	end

end
