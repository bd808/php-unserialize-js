require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

require 'jasmine-headless-webkit'
Jasmine::Headless::Task.new('jasmine:headless') do |t|
  t.colors = true
  t.keep_on_error = true
  t.jasmine_config = 'spec/support/jasmine.yml'
end

task :test => ['jasmine:headless']
task :default => [:test]
