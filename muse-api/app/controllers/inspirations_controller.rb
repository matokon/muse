class InspirationsController < ApplicationController
  def index
    inspirations = current_user.inspirations.with_attached_image.order(created_at: :desc)
    render json: { inspirations: inspirations.map { |inspiration| inspiration_payload(inspiration) } }
  end

  def create
    inspiration = current_user.inspirations.new(inspiration_params)

    if inspiration.save
      render json: { inspiration: inspiration_payload(inspiration) }, status: :created
    else
      render json: { errors: inspiration.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    inspiration = current_user.inspirations.find(params[:id])
    inspiration.destroy!
    head :no_content
  end

  private

  def inspiration_params
    params.permit(:caption, :image)
  end

  def inspiration_payload(inspiration)
    {
      id: inspiration.id,
      caption: inspiration.caption,
      created_at: inspiration.created_at.iso8601,
      image_url: url_for(inspiration.image)
    }
  end
end
