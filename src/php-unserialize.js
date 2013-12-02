/*!
 * php-unserialize-js JavaScript Library
 * https://github.com/bd808/php-unserialize-js
 *
 * Copyright 2013 Bryan Davis and contributors
 * Released under the MIT license
 * http://www.opensource.org/licenses/MIT
 */

/**
 * Parse php serialized data into js objects.
 *
 * @param {String} phpstr Php serialized string to parse
 * @return {mixed} Parsed result
 */
function phpUnserialize (phpstr) {
  var idx = 0
    // all values are placed here, but "R", which is PHP's reference
    , rstack = []
    , ridx = 0

    , readLength = function () {
        var del = phpstr.indexOf(':', idx)
          , val = phpstr.substring(idx, del);
        idx = del + 2;
        return parseInt(val);
      } //end readLength

    , readInt = function () {
        var del = phpstr.indexOf(';', idx)
          , val = phpstr.substring(idx, del);
        idx = del + 1;
        return parseInt(val);
      } //end readInt

    , parseAsInt = function () {
        var val = readInt();
        rstack[ridx++] = val;
        return val;
      } //end parseAsInt

    , parseAsFloat = function () {
        var del = phpstr.indexOf(';', idx)
          , val = phpstr.substring(idx, del);
        idx = del + 1;
        val = parseFloat(val);
        rstack[ridx++] = val;
        return val;
      } //end parseAsFloat

    , parseAsBoolean = function () {
        var del = phpstr.indexOf(';', idx)
          , val = phpstr.substring(idx, del);
        idx = del + 1;
        val = ("1" === val)? true: false;
        rstack[ridx++] = val;
        return val;
      } //end parseAsBoolean

    , readString = function () {
        var len = readLength()
          , utfLen = 0
          , bytes = 0
          , ch
          , val;
        while (bytes < len) {
          ch = phpstr.charCodeAt(idx + utfLen++);
          if (ch <= 0x007F) {
            bytes++;
          } else if (ch > 0x07FF) {
            bytes += 3;
          } else {
            bytes += 2;
          }
        }
        val = phpstr.substring(idx, idx + utfLen);
        idx += utfLen + 2;
        return val;
      } //end readString

    , parseAsString = function () {
        var val = readString();
        rstack[ridx++] = val;
        return val;
      } //end parseAsString

    , readKey = function () {
        var type = readType();
        switch (type) {
          case 'i': return readInt();
          case 's': return readString();
          default:
            throw {
              name: "Parse Error",
              message: "Unknown key type '" + type + "' at postion " + (idx - 2)
            }
        } //end switch
      }

    , parseAsArray = function () {
        var len = readLength()
          , resultArray = []
          , resultHash = {}
          , keep = resultArray
          , lref = ridx++
          , key
          , val;

        rstack[lref] = keep;
        for (var i = 0; i < len; i++) {
          key = readKey();
          val = parseNext();
          if (keep === resultArray && parseInt(key) == i) {
            // store in array version
            resultArray.push(val);
          } else {
            if (keep !== resultHash) {
              // found first non-sequential numeric key
              // convert existing data to hash
              for (var j = 0, alen = resultArray.length; j < alen; j++) {
                resultHash[j] = resultArray[j];
              }
              keep = resultHash;
              rstack[lref] = keep;
            }
            resultHash[key] = val;
          } //end if
        } //end for

        idx++;
        return keep;
      } //end parseAsArray

    , fixPropertyName = function (parsedName, baseClassName) {
        // <NUL>*<NUL>property
        // <NUL>class<NUL>property
        if ("\u0000" === parsedName.charAt(0)) {
          var pos = parsedName.indexOf("\u0000", 1);
          if (pos > 0) {
            var class_name = parsedName.substring(1, pos)
              , prop_name  = parsedName.substr(pos + 1)
            ;
            if ("*" === class_name) {
              // protected
              return prop_name;
            }
            else if (baseClassName === class_name) {
              // own private
              return prop_name;
            }
            else {
              // private of a descendant
              return class_name + "::" + prop_name;
              /* On the one hand, we need to prefix property name with
               * class name, because parent and child classes both may
               * have private property with same name. We don't want
               * just to overwrite it and lose something.
               *
               * On the other hand, property name can be "foo::bar"
               *
               *     $obj = new stdClass();
               *     $obj->{"foo::bar"} = 42;
               *     // any user-defined class can do this by default
               *
               * and such property also can overwrite something.
               *
               * So, we can to lose something in any way.
               */
            };
          };
        }
        // property
        else {
          return parsedName;
        };
      }

    , parseAsObject = function () {
        var len = readLength()
          , obj = {}
          , lref = ridx++
          , clazzname = phpstr.substring(idx, idx + len)
          , key
          , val;

        rstack[lref] = obj;
        idx += len + 2;
        len = readLength();
        for (var i = 0; i < len; i++) {
          key = readKey();
          // private members start with "\u0000CLASSNAME\u0000"
          //   any class name can be catched for private properties of descendant classes
          // we will replace it with "CLASSNAME::"
          // protected members start with "\u0000*\u0000"
          // we will strip these prefixes
          key = fixPropertyName(key, clazzname);
          val = parseNext();
          obj[key] = val;
        }
        idx++;
        return obj;
      } //end parseAsObject

    , parseAsRefValue = function () {
        var ref = readInt();
        // php's ref counter is 1-based; our stack is 0-based.
        var val = rstack[ref - 1];
        rstack[ridx++] = val;
        return val;
      } //end parseAsRefValue

    , parseAsRef = function () {
        var ref = readInt();
        // php's ref counter is 1-based; our stack is 0-based.
        return rstack[ref - 1];
      } //end parseAsRef

    , parseAsNull = function () {
        var val = null;
        rstack[ridx++] = val;
        return val;
      } //end parseAsNull

    , readType = function () {
        var type = phpstr.charAt(idx);
        idx += 2;
        return type;
      } //end readType

    , parseNext = function () {
        var type = readType();
        switch (type) {
          case 'i': return parseAsInt();
          case 'd': return parseAsFloat();
          case 'b': return parseAsBoolean();
          case 's': return parseAsString();
          case 'a': return parseAsArray();
          case 'O': return parseAsObject();

          // link to object, which is a value - affects rstack
          case 'r': return parseAsRefValue();

          // PHP's referese - DOES NOT affect rstack
          case 'R': return parseAsRef();

          case 'N': return parseAsNull();
          default:
            throw {
              name: "Parse Error",
              message: "Unknown type '" + type + "' at postion " + (idx - 2)
            }
        } //end switch
    }; //end parseNext

    return parseNext();
} //end phpUnserialize
