import * as FileSystem from 'expo-file-system';

export class DebugLogger {
  private static instance: DebugLogger;
  private logFile: string;
  private isEnabled: boolean = true;

  private constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = `${FileSystem.documentDirectory}debug_logs/voice_agent_${timestamp}.log`;
    this.initializeLogDirectory();
  }

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private async initializeLogDirectory() {
    const debugDir = `${FileSystem.documentDirectory}debug_logs/`;
    const dirInfo = await FileSystem.getInfoAsync(debugDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(debugDir, { intermediates: true });
    }
  }

  public async log(component: string, message: string, data?: any): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [${component}] ${message}${data ? '\nData: ' + JSON.stringify(data, null, 2) : ''}\n`;
      
      console.log(logEntry); // Also log to console
      
      await FileSystem.writeAsStringAsync(
        this.logFile,
        logEntry,
        { encoding: FileSystem.EncodingType.UTF8, append: true }
      );
    } catch (error) {
      console.error('Failed to write to debug log:', error);
    }
  }

  public async getLogContent(): Promise<string> {
    try {
      const exists = await FileSystem.getInfoAsync(this.logFile);
      if (!exists.exists) return '';
      
      return await FileSystem.readAsStringAsync(this.logFile);
    } catch (error) {
      console.error('Failed to read debug log:', error);
      return '';
    }
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public async clearLogs(): Promise<void> {
    try {
      const debugDir = `${FileSystem.documentDirectory}debug_logs/`;
      const dirInfo = await FileSystem.getInfoAsync(debugDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(debugDir, { idempotent: true });
        await this.initializeLogDirectory();
      }
    } catch (error) {
      console.error('Failed to clear debug logs:', error);
    }
  }
}

// Create a simple wrapper for easier usage
export const debugLog = (component: string, message: string, data?: any) => {
  DebugLogger.getInstance().log(component, message, data);
}; 