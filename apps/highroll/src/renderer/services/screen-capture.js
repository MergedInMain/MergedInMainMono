/**
 * Screen Capture Service
 * 
 * Provides functionality for capturing the screen in the HighRoll TFT Overlay application.
 * Uses Electron's desktopCapturer API to capture screenshots of the screen.
 */

/**
 * Captures a screenshot of a specific screen or window
 * @param {string} sourceId - The ID of the source to capture (screen or window)
 * @returns {Promise<string>} - A promise that resolves to a base64-encoded image
 */
export const captureSource = async (sourceId) => {
  try {
    // Create a video element to receive the stream
    const videoElement = document.createElement('video');
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);

    // Get the media stream for the source
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
        }
      }
    });

    // Set up the video element with the stream
    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };

    // Wait for the video to load
    await new Promise(resolve => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });

    // Create a canvas to capture the frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the video frame to the canvas
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Get the image data as base64
    const imageData = canvas.toDataURL('image/png');
    
    // Clean up
    stream.getTracks().forEach(track => track.stop());
    document.body.removeChild(videoElement);
    
    return imageData;
  } catch (error) {
    console.error('Error capturing source:', error);
    throw error;
  }
};

/**
 * Gets a list of available screen and window sources
 * @returns {Promise<Array>} - A promise that resolves to an array of sources
 */
export const getSources = async () => {
  try {
    // Request the list of sources from the main process
    const sources = await window.electron.getSources();
    return sources;
  } catch (error) {
    console.error('Error getting sources:', error);
    throw error;
  }
};

/**
 * Captures the primary screen
 * @returns {Promise<string>} - A promise that resolves to a base64-encoded image
 */
export const capturePrimaryScreen = async () => {
  try {
    // Request the screen capture from the main process
    const result = await window.electron.captureScreen();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error capturing primary screen:', error);
    throw error;
  }
};

/**
 * Captures a specific region of the screen
 * @param {Object} region - The region to capture {x, y, width, height}
 * @returns {Promise<string>} - A promise that resolves to a base64-encoded image
 */
export const captureRegion = async (region) => {
  try {
    // Request the region capture from the main process
    const result = await window.electron.captureRegion(region);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error capturing region:', error);
    throw error;
  }
};

export default {
  getSources,
  captureSource,
  capturePrimaryScreen,
  captureRegion
};
