class DataContentSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :filename, :format, :size, :created_at #, :creation_time
end
