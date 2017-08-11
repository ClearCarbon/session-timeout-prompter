'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Bootstrap3PromptRenderer = (function () {

  // timeoutWarningModal:    the jquery object for the Bootstrap3 modal to display
  //                         when the session is about to time out
  // timedOutModal:          the jquery object for the Bootstrap3 modal to display
  //                         when the session has timed out
  // remainingTextContainer: the jquery object for the display of the time remaining

  function Bootstrap3PromptRenderer(timeoutWarningModal, timedOutModal, remainingTextContainer) {
    _classCallCheck(this, Bootstrap3PromptRenderer);

    this.timeoutWarningModal = timeoutWarningModal;
    this.timedOutModal = timedOutModal;
  }

  _createClass(Bootstrap3PromptRenderer, [{
    key: 'renderTimedOut',
    value: function renderTimedOut() {
      this.timeoutWarningModal.modal('hide');
      this.timedOutModal.modal('show');
    }
  }, {
    key: 'renderTimeoutWarning',
    value: function renderTimeoutWarning(timeLeftInSeconds) {
      var wholeMinutesRemaining = Math.floor(timeLeftInSeconds / 60);
      var additionalSecondsRemaining = Math.floor(timeLeftInSeconds - wholeMinutesRemaining * 60);
      this.updateRemainingTimeText(wholeMinutesRemaining + 'm ' + additionalSecondsRemaining + 's');
      this.timeoutWarningModal.modal('show');
    }
  }, {
    key: 'hideAll',
    value: function hideAll() {
      this.timeoutWarningModal.modal('hide');
      this.timedOutModal.modal('hide');
    }

    // Private
  }, {
    key: 'updateRemainingTimeText',
    value: function updateRemainingTimeText(text) {
      this.remainingTextContainer.text(text);
    }
  }]);

  return Bootstrap3PromptRenderer;
})();
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServerPinger = (function () {
  function ServerPinger(serverPingPath) {
    _classCallCheck(this, ServerPinger);

    this.serverPingPath = serverPingPath;
    this.lastPingedAt = undefined;
  }

  _createClass(ServerPinger, [{
    key: "pingServerNow",
    value: function pingServerNow() {
      jQuery.post(this.serverPingPath, this.setLastPingedAt);
    }
  }, {
    key: "pingServerWithThrottling",
    value: function pingServerWithThrottling() {
      var ms_to_throttle = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];

      if (!this.lastPingedAt || this.currentTimestamp() - this.lastPingedAt > ms_to_throttle) {
        this.pingServerNow();
      }
    }

    // Private
  }, {
    key: "setLastPingedAt",
    value: function setLastPingedAt() {
      this.lastPingedAt = this.currentTimestamp();
    }
  }, {
    key: "currentTimestamp",
    value: function currentTimestamp() {
      return Math.floor(new Date().getTime() / 1000);
    }
  }]);

  return ServerPinger;
})();
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var SessionTimeoutPrompter = (function () {
  function SessionTimeoutPrompter(configData) {
    _classCallCheck(this, SessionTimeoutPrompter);

    var serverPingPath = configData.serverPingPath;
    var timeoutWarningInSeconds = configData.timeoutWarningInSeconds;
    var sessionTimeoutInSeconds = configData.sessionTimeoutInSeconds;
    var sessionKey = configData.sessionKey;

    var timeoutWarningModal = jQuery('#session-timeout-prompter-timeout-warning-modal');
    var timedOutModal = jQuery('#session-timeout-prompter-session-timed-out-modal');
    var remainingTimeContainer = jQuery('#session-timeout-prompter-warning-timeout-in');

    var promptRenderer = new Bootstrap3PromptRenderer(timeoutWarningModal, timedOutModal, remainingTimeContainer);

    this.timeoutTimer = new TimeoutTimer(timeoutWarningInSeconds, sessionTimeoutInSeconds, sessionKey, promptRenderer);
    this.serverPinger = new ServerPinger(serverPingPath);
    this.remainLoggedInButton = jQuery('#session-timeout-prompter-remain-logged-in-btn');
  }

  _createClass(SessionTimeoutPrompter, [{
    key: 'start',
    value: function start() {
      this.bindDefaultEvents();
      this.timeoutTimer.start();
    }

    // Private

  }, {
    key: 'bindDefaultEvents',
    value: function bindDefaultEvents() {
      var _this = this;

      // Restart the timer: This is triggered by any jquery ajax request completing,
      // including pinging the server via our other events.
      jQuery(document).ajaxComplete(function () {
        _this.timeoutTimer.restart();
      });

      // Ping server on scroll
      jQuery(window).on('scroll', function () {
        _this.serverPinger.pingServerWithThrottling();
      });

      // Ping server when typing or clicking
      jQuery(document).on('keydown click', function () {
        _this.serverPinger.pingServerWithThrottling();
      });

      // When the user clicks the button to say they want to remain logged in we
      // stop the timer to wait until it is restarted via via the ajaxComplete()
      // event triggered by the ping
      this.remainLoggedInButton.on('click', function () {
        _this.serverPinger.pingServerNow();
        _this.timeoutTimer.stop();
      });

      // Listen to the storage event fired in TuimeoutTimer to synchronise browser tabs
      // if a user extends their session in one tab but has another open for example.
      jQuery(window).on('storage', function (e) {
        var event = e.originalEvent;
        _this.timeoutTimer.localStorageUpdated(event.key, event.newValue);
      });
    }
  }]);

  return SessionTimeoutPrompter;
})();
"use strict";

// jQuery(() => {
//
//   const timeoutPrompterContainer = jQuery('#session-timeout-prompter-container');
//
//   // If the container cannot be found then assume we don't need it on this page.
//   if (timeoutPrompterContainer) {
//     const configData = timeoutPrompterContainer.data();
//     const sessionTimeoutPrompter = new SessiomTimeoutPrompter(configData);
//     sessionTimeoutPrompter.start();
//   }
//
//
//
//   // Ping server when scrolling inside a modal window
//   // Event only exists if using ajax_modal from epiJs
//   jQuery(document).on('ajax-modal-show', () => {
//     jQuery('#modalWindow').scroll( () => {
//       serverPinger.pingServerWithThrottling();
//     });
//   });
//
//   // TODO: Ability to plug in CKEditor to ping
//
// });
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimeoutTimer = (function () {

  // timeoutWarningInSeconds: Warning that their session is about to timeout
  //                          when there are this many minutes left.
  // sessionTimeoutInSeconds: Tell them their session has timed out when this
  //                          many minutes have elapsed.
  // sessionKey:              Unique key for this session - used in local storage
  //                          to make sure multiple browser tabs are synched.

  function TimeoutTimer(timeoutWarningInSeconds, sessionTimeoutInSeconds, sessionKey, promptRenderer) {
    _classCallCheck(this, TimeoutTimer);

    this.sessionTimeoutInSeconds = sessionTimeoutInSeconds;
    this.timeoutWarningInSeconds = timeoutWarningInSeconds;
    this.sessionKey = sessionKey;
    this.promptRenderer = promptRenderer;
    this.tickInterval = undefined;
    this.timeoutAt = undefined;
    this.currentlyShowingWarningPrompt = false;
    this.recalculateTimeoutAt();
  }

  _createClass(TimeoutTimer, [{
    key: "start",
    value: function start() {
      var _this = this;

      this.tick();
      this.tickInterval = setInterval(function () {
        _this.tick();
      }, 1000);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.promptRenderer.hideAll();
      clearInterval(this.tickInterval);
    }
  }, {
    key: "restart",
    value: function restart() {
      this.stop();
      this.recalculateTimeoutAt();
      this.start();
    }
  }, {
    key: "localStorageUpdated",
    value: function localStorageUpdated(key, newTimeoutAt) {
      if (key === this.sessionKey) {
        this.stop();
        this.timeoutAt = newTimeoutAt;
        this.start();
      }
    }

    // Private
  }, {
    key: "tick",
    value: function tick() {
      var timeLeftInSeconds = this.timeoutAt - this.currentTimestamp();
      if (timeLeftInSeconds <= 0) {
        this.showTimedOutPrompt();
      } else if (timeLeftInSeconds <= this.timeoutWarningInSeconds) {
        this.showTimeoutWarningPrompt(timeLeftInSeconds);
      }
    }
  }, {
    key: "showTimedOutPrompt",
    value: function showTimedOutPrompt() {
      this.stop();
      this.promptRenderer.renderTimedOut();
    }
  }, {
    key: "showTimeoutWarningPrompt",
    value: function showTimeoutWarningPrompt(timeLeftInSeconds) {
      if (!this.currentlyShowingWarningPrompt) {
        this.currentlyShowingWarningPrompt = true;
        this.promptRenderer.renderTimeoutWarning(timeLeftInSeconds);
      }
    }

    // We need to use the system time rather than the setTimeout function as it
    // is inherently innacurate.
  }, {
    key: "recalculateTimeoutAt",
    value: function recalculateTimeoutAt() {
      this.timeoutAt = this.currentTimestamp() + this.sessionTimeoutInSeconds;
      localStorage.setItem(this.sessionKey, this.timeoutAt);
    }
  }, {
    key: "currentTimestamp",
    value: function currentTimestamp() {
      return Math.floor(new Date().getTime() / 1000);
    }
  }]);

  return TimeoutTimer;
})();
