config = YAML.load_file(Rails.root.join('config/cibids.yml'))[Rails.env]
# Cibids::URL = config["url"]