class SessionTimeoutPrompter {

  constructor(configData) {
    const serverPingPath          = configData.serverPingPath;
    const timeoutWarningInSeconds = configData.timeoutWarningInSeconds;
    const sessionTimeoutInSeconds = configData.sessionTimeoutInSeconds;
    const sessionKey              = configData.sessionKey;

    const timeoutWarningModal     = jQuery('#session-timeout-prompter-timeout-warning-modal');
    const timedOutModal           = jQuery('#session-timeout-prompter-session-timed-out-modal');
    const remainingTimeContainer  = jQuery('#session-timeout-prompter-warning-timeout-in');

    const promptRenderer = new Bootstrap3PromptRenderer(timeoutWarningModal, timedOutModal, remainingTimeContainer);

    this.timeoutTimer = new TimeoutTimer(timeoutWarningInSeconds, sessionTimeoutInSeconds, sessionKey, promptRenderer);
    this.serverPinger = new ServerPinger(serverPingPath);
    this.remainLoggedInButton = jQuery('#session-timeout-prompter-remain-logged-in-btn');
  }

  start() {
    this.bindDefaultEvents();
    this.timeoutTimer.start();
  }


  // Private

  bindDefaultEvents() {
    // Restart the timer: This is triggered by any jquery ajax request completing,
    // including pinging the server via our other events.
    jQuery(document).ajaxComplete( () => {
      this.timeoutTimer.restart();
    });

    // Ping server on scroll
    jQuery(window).on('scroll', () => {
      this.serverPinger.pingServerWithThrottling();
    });

    // Ping server when typing or clicking
    jQuery(document).on('keydown click', () => {
      this.serverPinger.pingServerWithThrottling();
    });

    // When the user clicks the button to say they want to remain logged in we
    // stop the timer to wait until it is restarted via via the ajaxComplete()
    // event triggered by the ping
    this.remainLoggedInButton.on('click', () => {
      this.serverPinger.pingServerNow();
      this.timeoutTimer.stop();
    });

    // Listen to the storage event fired in TuimeoutTimer to synchronise browser tabs
    // if a user extends their session in one tab but has another open for example.
    jQuery(window).on('storage', e => {
      const event = e.originalEvent;
      this.timeoutTimer.localStorageUpdated(event.key, event.newValue);
    });
  }

}
