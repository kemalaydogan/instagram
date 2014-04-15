class PostsController < ApplicationController

	def index
		@posts = Post.all 
	end

	def new
		@post = Post.new
	end

	def create
		@post = Post.new(post_params)
		if @post.save
			redirect_to '/posts'
		else
			flash[:errors] = "Please submit a valid post"
			render 'new'
		end
	end

	def destroy
		@post = Post.find params[:id]
		@post.destroy
		flash[:notice] = "Post Deleted!"
		redirect_to '/posts'
	end

	def edit
		@post = Post.find params[:id]
	end

	def update
		@post = Post.find params[:id]
		@post.update post_params
		flash[:notice] = "Post updated successfully"
		redirect_to '/posts'
	end

	def post_params
		params[:post].permit(:description, :picture)
	end

end
