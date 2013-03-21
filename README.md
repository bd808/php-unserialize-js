php-unserialize-js
==================

Convert serialized PHP data to a javascript object graph.

[![Build Status][ci-status]][ci-home]

Why?
----
> OMG why would anyone do something this perverse? PHP has a `json_encode()`
> method so you don't have to try and cobble together ugly hacks like this.

It all started so innocently. The guy at the desk next to mine asked "hey is
there a javascript library that can turn this php serialize mess into
something that I can read?" I gaped. He explained that he was trying to slap
together a js testing harness for a set to REST services that returned
serialized PHP as their transport representation.

A [google search][] turned up [something][] so went back to listening to the
latest [OMM][] album. Fifteen minutes later the stream of curses coming from
Gallilama started harshing my groove. It turns out that the venerable phpjs
function only handles a particular subset of PHP's serialization output.
Specifically it doesn't handle references and objects at all. Google found
a [java implementation][] that looked more complete. I did a quick port of it
to javascript and moved on to my [$wingin' Utter$][] playlist.

The next day I checked in and found out that strange things we afoot with my
port. It turns out that private and protected members `serialize` in an
"interesting" way. PHP prepends the member name with either the class name
(private) or an asterisk (protected) surrounded by null bytes. The hack parser
was going into an infinite loop when it tried to extract these values.

By this point I was fully committed. Nothing less than a TDD validated library
that could handle just about any craziness I threw at it would do. I'm sure
there are still gaps, but this "quick hack" is working for our twisted needs.

Implementation Details
----------------------
PHP's serialization format is not well documented, but this function takes
a best guess approach to parsing and interpreting it. Serialized integers,
floats, booleans, strings, arrays, objects and references are currently
supported.

PHP's array type is a hybrid of javascript's array and object types.
phpUnserialize translates PHP arrays having only 0-based consecutive numeric
keys into javascript arrays. All other arrays are translated into javascript
objects.

Members of a PHP object carry scope information via name mangling.
phpUnserialize strips the scope signifier prefix from private and protected
members.

Check out the [jasmine tests][] for more details or read the source.

Running the Unit Tests
----------------------
    cd php-unserialize-js
    bundle install
    rake

---
[ci-status]: https://secure.travis-ci.org/bd808/php-unserialize-js.png
[ci-home]: http://travis-ci.org/bd808/php-unserialize-js
[google search]: https://www.google.com/search?q=php+unserialize+javascript
[something]: http://phpjs.org/functions/unserialize/
[OMM]: http://www.oldmanmarkley.com/
[java implementation]: https://code.google.com/p/serialized-php-parser
[$wingin' Utter$]: http://swinginutters.com/
[jasmine tests]: spec/php-unserialize_spec.coffee
