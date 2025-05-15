const { Application } = require('spectron');
const path = require('path');
const assert = require('assert');

describe('Application launch', function () {
  this.timeout(10000);

  beforeEach(function () {
    this.app = new Application({
      path: require('electron'),
      args: [path.join(__dirname, '..')],
    });
    return this.app.start();
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('shows the main window', async function () {
    const windowCount = await this.app.client.getWindowCount();
    assert.strictEqual(windowCount, 2); // Main window and overlay window
  });

  it('has the correct title', async function () {
    const title = await this.app.client.getTitle();
    assert.strictEqual(title, 'HighRoll TFT Overlay');
  });
});
