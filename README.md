php-unserialize-js
==================

Convert serialized PHP data to a javascript object graph.

Php's serialization format is not well documented, but this function takes
a best guess approach to parsing and interpreting it. Serialized integers,
floats, booleans, strings, arrays, objects and references are currently
supported.

Php's array type is a hybrid of javascript's array and object types.

