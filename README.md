webcam-tracker
===

by [Nate Beatty](http://natebeatty.com) for [IrisVR](http://irisvr.com) hackday on July 11, 2014

Developing
===

Third Party JS Libs
---

### [Modernizr](http://modernizr.com)

I am using a custom build of Modernizr with the following options:

* HTML5
    * webworkers
* Extra
    * html5shiv
    * Modernizr.load
    * Add CSS Classes
* Non-core detects
    * getusermedia

Testing
---

Start a local server by running `$ npm start` and navigate to [localhost:8080](http://localhost:8080).

Generating CSS
---

I am using SASS and [Compass](http://compass-style.org) to generate my CSS. Make sure you have the compass gem installed by following the installation instructions [here](http://compass-style.org/install/). Do not edit anything in the CSS directory. Make all stylesheet edits in the SASS directory files and then generate the CSS by running:

    $ compass compile

Watch the SASS directory for changes by running

    $ compass watch
