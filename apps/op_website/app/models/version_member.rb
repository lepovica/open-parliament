class VersionMember < ActiveRecord::Base
  belongs_to :version
  belongs_to :member
end
