var Story = require('../ext/storyjs/story/story').Story;
var _ = require('../ext/storyjs/story/layer');
var fs = require("fs");

Story.Plot.Define("Consequence", function() {
  this.plot = _._args();
}, {
  setup: function() {
    this.devices = _.map(this.plot, Story.Plot.Device.setup);
    this.index = 0;
  },
  update: function() {
    while(this.index < this.devices.length) {
      if(Story.Plot.Device.update(this.devices[this.index])) {
        return true;
      }
      this.index++;
    }
    return false;
  },
  teardown: function() {
    _.each(this.devices, Story.Plot.Device.teardown);
  },
  handle: function(arg) {
    if(this.index < this.devices.length) {
      Story.Plot.Device.handle(this.devices[this.index], arg);
    }
  }
})

Story.Plot.Define('Catch', function(name, capture) {
  var source = name;
  var target = name;
  name.replace(/([^:]*):(.*)/, function(match, s, t) {
    source = s;
    target = t;
  });
  this.source = source;
  this.target = target;
  this.capture = Story.Plot.Build(["#Sequence"].concat(capture));
  this.response = Story.Plot.Build(_._args());
}, {
  setup: function() {
    this.device = Story.Plot.Device.setup(this.capture);
  },
  update: function() {
    var result = Story.Plot.Device.update(this.device);
    if(!this.responding) {
      var wired = Story.wire(this.source);
      if(wired) {
        this.responding = true;
        Story.wire(this.target, wired);
        Story.Plot.Device.teardown(this.device);
        this.device = Story.Plot.Device.setup(this.response);
        result = Story.Plot.Device.update(this.device);
      }
    }
    return result;
  },
  teardown: function() {
    Story.Plot.Device.teardown(this.device);
  }
});

function BuildPath(pattern, scope) {
    return pattern.replace(/%{([^}]*)}/g, function(match, key) {
        return Story.read(key) || "";
    });
}

Story.Plot.Define('ReadFile', function(path) {
  this.path = path;
}, {
  setup: function() {
    var path = this.path; 
    if(typeof path === 'function') path = path.call(this);
    else path = BuildPath(path);
    fs.readFile(path, Story.callback(function(err, data) {
      this.done = true;
      if(this.cancelled) return;
      if(!err) this.result = { path: path, data: data };
    }));
  },
  update: function() {
    if(this.done) {
      if(this.result) Story.wire("data", this.result);
    }
    return !this.done;
  },
  teardown: function() {
    this.cancelled = true;
  }
});

function MimeTypeForPath(path) {
  var ext; 
  path.replace(/\.([^.]*)$/, function(match, e) {
    ext = e;
  });
  return {
    "html" : "text/html",
    "js" : "text/javascript",
    "css" : "text/css"
  }[ext] || "text/plain";
}

var RewriteStory = new Story(Story.Catch("data:file", Story.Consequence(
  Story.ReadFile("%{root}/%{path}"),
  Story.ReadFile("%{root}/%{path}.html"),
  Story.ReadFile("%{root}/%{path}.htm"),
  Story.ReadFile("%{root}/404.html")
), function() {
  var path = Story.wire("file").path;
  fs.readFile(path, Story.callback(function(err, data) {
    var response = Story.read("response");
    response.writeHead(200, {'Content-Type': MimeTypeForPath(path)});
    response.end(data);
  }));
}));

require('http').createServer(function(request, response) {
  var file;
  request.url.replace(/([^?#]*)/, function(match, f) {
    file = f;
  });
  if(file == "/") file = "index";
  RewriteStory.tell({
    request: request, 
    response: response, 
    path: file, 
    root: "build/adam-f.github.com"
  });
}).listen(3000, "127.0.0.1");
