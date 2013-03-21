php-unserialize-js
==================

Convert serialized PHP data to a javascript object graph.

[![Build Status][ci-status]][ci-home]

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

Running the Unit Tests
----------------------
    cd php-unserialize-js
    bundle install
    rake

---
[ci-status]: https://secure.travis-ci.org/bd808/php-unserialize-js.png
[ci-home]: http://travis-ci.org/bd808/php-unserialize-js
