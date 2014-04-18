class Member < ActiveRecord::Base
  has_many :votes
  has_many :speeches
  has_many :asked, :foreign_key => "questioner_id"
  has_many :participations
  has_many :structures, through: :participations

  def self.find_by_three_names names
    names = names.split
    Member.where(:first_name => names[0], :sir_name => names[1], :last_name => names[2]).first
  end

  def self.find_by_two_names names
    names = names.split.map { |n| n.mb_chars.upcase.to_s }
    Member.where(:first_name => names[0], :last_name => names[1]).first
  end

  def self.find_by_names_and_bd first_name, sir_name, last_name, date_of_birth
    if date_of_birth == '00/00/0000'
      Member.where(:first_name => first_name, :sir_name => sir_name, :last_name => last_name).first_or_initialize
    else
      birth_day = Date.parse(date_of_birth).strftime("%Y-%m-%d")
      Member.where(:first_name => first_name, :sir_name => sir_name, :last_name => last_name, birthday: birth_day).first_or_initialize
    end
  end

  def names
    (self.first_name + " " + self.sir_name + " " + self.last_name).mb_chars.titleize
  end

end
