declare global {
  interface Window {
    electron: {
      saveToFileSystem: (content: any) => Promise<boolean>;
      loadFromFileSystem: () => Promise<any>;
      loadLocalModel: (modelPath: string) => Promise<boolean>;
      getApiKey: () => Promise<string | null>;
      setApiKey: (key: string) => Promise<boolean>;
      getAppVersion: () => Promise<string>;
    };
  }
}

export {};