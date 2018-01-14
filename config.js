var config = [];

// the server port, the trunker-recorder will connect ot this, as well as the status website.
config.port = 8888;

// the folder where the captures can be located
config.captureDirectory = "/home/amlethojalen/captures";

// the url prefix for capture files, this can be any random value, changing it will break previous captures
config.captureURLPrefix = "/captures";

module.exports = config;