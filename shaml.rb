require 'rubygems'
require 'haml'

module Shaml
  class Engine
    def initialize *args
      @scope = { :engines => [], :content => {}, :features => {} }
    end

    def engine
      @scope[:engines].last
    end

    def capture &block
      haml_context = eval("self", block.binding)
      haml_context.capture_haml do
        block.call
      end
    end

    def content_for content, &block
      @scope[:content][content.to_sym] ||= "";
      if block_given?
        @scope[:content][content.to_sym] += capture &block
      else
        @scope[:content][content.to_sym] += content.first
      end
    end

    def uses template
      return if @scope[:features][template.to_sym]
      @scope[:features][template.to_sym] = true
      input = File.open("source/feature/_#{template}.html.haml").read
      engine = Haml::Engine.new(input)
      @scope[:engines].push(engine)
      engine.render(self)
    ensure
      @scope[:engines].pop
    end

    def render template, layout = "= yield"
      template_engine = Haml::Engine.new(template)
      layout_engine = Haml::Engine.new(layout)

      @scope[:content][:_yield] = template_engine.render(self)

      layout_engine.render(self)do |*name|
        @scope[:content][name.first || :_yield] || ''
      end
    end
  end
end

if __FILE__ == $0
  layout = "= yield"
  if ARGV.length > 0
    input = begin
      File.open(ARGV[0])
    rescue
      File.open('source/' + ARGV[0] + '.html.haml')
    end.read
    layout = begin
      File.open(ARGV[1]).read
    rescue
      File.open('source/layout/' + ARGV[1] + '.html.haml')
    end.read if ARGV.length > 1
  else
    input = STDIN.read
  end

  print Shaml::Engine.new.render(input, layout)
end

# vim:set sw=2 ts=2 expandtab:
