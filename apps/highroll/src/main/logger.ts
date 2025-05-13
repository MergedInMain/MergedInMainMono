import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import electronLog from 'electron-log';

/**
 * Configure electron-log
 *
 * By default, electron-log writes logs to the following locations:
 * - on Linux: ~/.config/{app name}/logs/{process type}.log
 * - on macOS: ~/Library/Logs/{app name}/{process type}.log
 * - on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
 */

// Configure log file
electronLog.transports.file.resolvePathFn = () => {
  const userDataPath = app.getPath('userData');
  const logsDir = path.join(userDataPath, 'logs');

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const date = new Date();
  const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `highroll-${timestamp}.log`);
};

// Configure log level
electronLog.transports.file.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
electronLog.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

// Format logs
electronLog.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
electronLog.transports.console.format = '[{level}] {text}';

// Export the logger
export const logger = electronLog;

/**
 * Sets up the logger with application information
 */
export function setupLogger(): void {
  const appVersion = app.getVersion();
  const nodeVersion = process.versions.node;
  const electronVersion = process.versions.electron;

  logger.info('----------------------------------------');
  logger.info(`HighRoll Application Starting - ${new Date().toLocaleString()}`);
  logger.info(`App Version: ${appVersion}`);
  logger.info(`Node Version: ${nodeVersion}`);
  logger.info(`Electron Version: ${electronVersion}`);
  logger.info(`Platform: ${process.platform}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'production'}`);
  logger.info(`Log Level: ${electronLog.transports.file.level}`);
  logger.info('----------------------------------------');
}
