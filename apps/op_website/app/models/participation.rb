class Participation < ActiveRecord::Base
  belongs_to :member
  belongs_to :structure
end
