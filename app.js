/**
 * Serves the contents of the /public directory
 */

var connect = require("connect");
var serveStatic = require("serve-static");
connect().use(serveStatic(__dirname + "/public")).listen(7000);
