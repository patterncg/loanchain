interface EthereumRequest {
  method: string;
  params?: unknown[];
}

interface Ethereum {
  isMetaMask?: boolean;
  request: (request: EthereumRequest) => Promise<unknown>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export {};
