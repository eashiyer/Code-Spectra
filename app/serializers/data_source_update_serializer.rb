class DataSourceUpdateSerializer < ActiveModel::Serializer
	embed :ids
	attributes :id, :dimensions_str, :groups_str, :fields_str, :name, :data_source_type, :load_count, :enabled,
					:data_types_updated, :unique_str, :index_str, :file_upload_state, :sheets_array, :ignored_str,
					:preview_data, :preview_headers, :updated_at
	has_many :data_contents

end