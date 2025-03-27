# Wallet Connection Testing Guide

This document provides a step-by-step guide to test the wallet connection functionality in the LoanChain application.

## Prerequisites

- MetaMask browser extension installed and configured
- A wallet with some DEV tokens (Moonbase Alpha testnet)
- The application running locally

## Test Steps

### 1. Initial Wallet Connection Test

1. Open the application in your browser
2. Click the "Show Connection Helper" button in the top-right corner
3. In the connection helper, check if a provider is detected:
   - MetaMask Available: Should show "✅ Yes" if MetaMask is installed
   - Connected to MetaMask: Should show "✅ Yes" if you're already connected to MetaMask
   - Connected to App: Should show if the application has detected your wallet connection

### 2. Connection Tests

#### Test A: Fresh Connection

1. If not connected to MetaMask, use the "Connect MetaMask" button in the Connection Helper
2. Observe if the MetaMask popup appears requesting to connect
3. Approve the connection in MetaMask
4. Check if both "Connected to MetaMask" and "Connected to App" show "✅ Yes"

#### Test B: Handling Existing MetaMask Connection

If you're already connected to MetaMask (showing "✅ Yes" for "Connected to MetaMask") but not connected to the app:

1. Use the "Sync Connection with App" button in the Connection Helper
2. This should synchronize your existing MetaMask connection with the application
3. After syncing, both connection indicators should show "✅ Yes"
4. The application content should now be visible instead of the "Connect Wallet" prompt

### 3. Network Switching Test

1. Once connected, check the Chain ID displayed in the Connection Status
2. If not on Moonbase Alpha (Chain ID: 1287), you should see a "Wrong Network" card
3. Click on the network switcher in the header (shows red dot if on wrong network)
4. Select "Moonbase Alpha" from the dropdown
5. Approve the network switch in the MetaMask popup
6. Verify the Chain ID changes to 1287 and shows "✅ Moonbase Alpha"

### 4. End-to-End Workflow Test

Once wallet connection is working properly:

1. Go through the loan creation wizard steps:

   - Fill in loan details (amount, interest rate, term, purpose, etc.)
   - Add borrower information
   - Define loan terms
   - Review the AI-enhanced loan preview
   - Test the metadata confirmation step

2. On the metadata confirmation step, test:
   - Both formatted and raw JSON views
   - Gas fee selection with different priorities
   - Agreement checkbox functionality
   - Mint button activation (should only be active after checking agreement)

### 5. Testing Page Reloads with Existing Connection

1. Connect to the application using the steps above
2. Once connected and seeing the loan creation wizard, reload the page
3. The application should now:
   - Automatically detect your existing MetaMask connection
   - If it doesn't automatically synchronize, a yellow notification will appear suggesting to use the Connection Helper
   - Follow the prompt to show the Connection Helper and use the "Sync Connection with App" button
4. After syncing, you should be able to continue using the application without reconnecting

### 6. Common Issues & Troubleshooting

- **MetaMask not detected**:

  - Check if MetaMask is installed and unlocked
  - Reload the page with MetaMask unlocked
  - Check browser console for errors related to wallet providers

- **Connected to MetaMask but not to application**:

  - Use the Connection Helper's "Sync Connection with App" button
  - If that doesn't work, try disconnecting from the site in MetaMask and reconnecting

- **Connection Request Not Appearing**:

  - Check if MetaMask notifications are blocked in your browser
  - Try clicking the MetaMask icon in your browser extensions

- **Network Switching Issues**:

  - Check if you can manually add Moonbase Alpha in MetaMask
  - Network details:
    - Network Name: Moonbase Alpha
    - Chain ID: 1287 (0x507 in hex)
    - RPC URL: https://rpc.api.moonbase.moonbeam.network
    - Currency Symbol: DEV

- **WagmiProvider Errors in Console**:

  - If you see errors like `useConfig must be used within WagmiProvider`, this indicates a React component hierarchy issue
  - All components using wagmi hooks must be children of the WagmiProvider component
  - The application has been structured to ensure proper provider ordering with wagmi hooks used only within AppContent which is wrapped by WagmiProvider

- **Provider Details Debug Information**:
  - Check the Provider Details section in the Connection Helper
  - This includes detailed information about the detected provider
  - Look for methods like `eth_requestAccounts` and `wallet_switchEthereumChain`

### 7. Technical Architecture Notes

The wallet connection system uses a layered approach:

1. **Base Provider Detection**:

   - Direct interaction with `window.ethereum` object to detect connection status
   - Used in the Connection Helper to provide accurate connection information

2. **Wagmi Integration Layer**:

   - All wagmi hooks must be used within the WagmiProvider context
   - The application uses a structured component hierarchy to ensure proper context nesting
   - Component order: `App > WagmiProvider > AppContent > [Components using wagmi hooks]`

3. **Connection Synchronization**:
   - The MetaMaskFixer component bridges direct provider detection with wagmi state
   - When a discrepancy is detected, it helps users synchronize their connection

## Reporting Issues

When reporting wallet connection issues, please include:

1. Browser and version
2. MetaMask version
3. Steps to reproduce the issue
4. Error messages (if any) from the Connection Helper
5. Console logs (if technical)
