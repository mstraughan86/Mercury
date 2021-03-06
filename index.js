'use strict';

var RtmClient = require('@slack/client').RtmClient,
  WebClient = require('@slack/client').WebClient,
  MemoryDataStore = require('@slack/client').MemoryDataStore,

  RTM_EVENTS = require('@slack/client').RTM_EVENTS,
  CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS,

  util = {
    config: require('./util/config'),
    command: require('./util/command')
  },

  dispatcher = require('./dispatcher'),
  rtmClient, webClient;

var _listen = function () {
  dispatcher.init(rtmClient);

  rtmClient.on(RTM_EVENTS.MESSAGE, function (message) {
    dispatcher.handle(message);
  });
};

var _login = function () {

  if (!rtmClient) {
    throw new Error('Slack RTM client not initialized');
  }

  console.log('Mercury: Initiating RTM client authentication.');
  rtmClient.start();

  rtmClient.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    if (!dispatcher.isInitialized()) {
      console.log('Mercury: RTM client authenticated.');
      _listen();
    }
  });
};

var getRTMClient = function () {
  return rtmClient;
};

var getWebClient = function () {
  return webClient;
};

var init = function (token, opts, config) {

  if (!token) {
    throw new Error('slack token not passed with opts in init');
  }

  // set defaults if not provided
  opts.autoReconnect = opts.autoReconnect || true;
  opts.logLevel = opts.logLevel || 'error';
  opts.dataStore = new MemoryDataStore({});

  rtmClient = new RtmClient(token, opts);
  webClient = new WebClient(token, opts);

  util.config.init(config);

  _login();
};

const parseCommand = (msg) => {
  dispatcher.internalHandle(msg);
};

exports.init          = init;
exports.getCommands   = util.command.getCommandObjects;
exports.getResponses  = util.command.getResponseObjects;
exports.getRTMClient  = getRTMClient;
exports.getWebClient  = getWebClient;
exports.RTM_EVENTS    = RTM_EVENTS;    // Access to this object makes sync code easier.
exports.CLIENT_EVENTS = CLIENT_EVENTS; // Access to this object makes sync code easier.
exports.parseCommand  = parseCommand;