class CommentSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :message, :author_name, :author_id, :status, :chart_id
end
