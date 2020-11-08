export const parseBodyString = (str) => {
  var properties = str.split('&');
  var obj = {};
  properties.forEach(function(property) {
    var tup = property.split('=');
    obj[tup[0]] = tup[1];
  });
  return obj;
};
