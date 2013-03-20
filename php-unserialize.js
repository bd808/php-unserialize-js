/**
 * Parse php serialized data into js objects.
 *
 * @param string input Php serialized string to parse
 * @return mixed Parsed result
 * @author Bryan Davis <bd808@bd808.com>
 */
function php_unserialize (input) {
  // strings produced by PHP's serialize() function take the general form:
  //   TYPE(:LENGTH):DATA;
  // LENGTH is only present for string, array and object data types.
  var index = 0

    , readLength = function () {
        var del = input.indexOf(':', index)
          , val = input.substring(index, del);
        index = del + 2;
        return parseInt(val);
      } //end readLength

    , parseAsInt = function () {
        var del = input.indexOf(';', index)
          , val = input.substring(index, del);
        index = del + 1;
        return parseInt(val);
      } //end parseAsInt

    , parseAsFloat = function () {
        var del = input.indexOf(';', index)
          , val = input.substring(index, del);
        index = del + 1;
        return parseFloat(val);
      } //end parseAsFloat

    , parseAsBoolean = function () {
        var del = input.indexOf(';', index)
          , val = input.substring(index, del);
        index = del + 1;
        return ("1" === val)? true: false;
      } //end parseAsBoolean

    , parseAsString = function () {
        var len = readLength()
          , utfLen = 0
          , bytes = 0
          , ch
          , val;
        while (bytes < len) {
          ch = input.charCodeAt(index + utfLen++);
          if (ch <= 0x007F) {
            bytes++;
          } else if (ch > 0x07FF) {
            bytes += 3;
          } else {
            bytes += 2;
          }
        }
        val = input.substring(index, index + utfLen);
        index += utfLen + 2;
        return val;
      } //end parseAsString

    , parseAsArray = function () {
        var len = readLength()
          , resultArray = []
          , resultHash = {}
          , keep = resultArray
          , key
          , val;
        for (var i = 0; i < len; i++) {
          key = parseNext();
          val = parseNext();
          resultHash[key] = val;
          if (keep === resultArray && parseInt(key) == i) {
            resultArray.push(val);
          } else {
            keep = resultHash;
          }
        }
        index++;
        return keep;
      } //end parseAsArray

    , parseAsObject = function () {
        var len = readLength()
          , obj = {}
          , key
          , val
          , classname = input.substring(index, index + len)
          , re_strip = new RegExp("\x0000(\*|" + classname + ")\x0000");

        index += len + 2;
        len = readLength();
        for (var i = 0; i < len; i++) {
          key = parseNext();
          // private members start with "\x0000CLASSNAME\x0000"
          // protected members start with "\x0000*\x0000"
          // we will strip these prefixes
          key = key.replace(re_strip, '');
          val = parseNext();
          obj[key] = val;
        }
        index++;
        return obj;
      } //end parseAsObject

    , readType = function () {
        var type = input.charAt(index);
        index += 2;
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
          case 'N': return null;
          default:
            throw {
              name: "Parse Error",
              message: "Unknown type '" + type + "' at postion " + (index - 2)
            }
        } //end switch
    }; //end parseNext

    return parseNext();
} //end php_unserialize
