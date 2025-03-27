import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { createMockTransactionService, createMockContractService, 
  createMockFeedService, createMockTokenDetailService } from '@/lib/contract-integration/test/mocks';

// Create service context for dependency injection
interface ServiceContextType {
  transactionService: ReturnType<typeof createMockTransactionService>;
  contractService: ReturnType<typeof createMockContractService>;
  feedService: ReturnType<typeof createMockFeedService>;
  tokenDetailService: ReturnType<typeof createMockTokenDetailService>;
}

const ServiceContext = React.createContext<ServiceContextType | undefined>(undefined);

// Mock Theme Provider to avoid theme-related dependencies
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="theme-provider">{children}</div>;
};

// Define additional options for the custom render method
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  services?: Partial<ServiceContextType>;
}

// Export the service hooks for tests to use
export const useTestServices = () => {
  const context = React.useContext(ServiceContext);
  if (!context) {
    throw new Error('useTestServices must be used within a TestServiceProvider');
  }
  return context;
};

/**
 * Custom render function that wraps the component with all necessary providers
 * This ensures components have access to context they would normally have in the app
 */
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  // Set up any route if provided
  if (options?.route) {
    window.history.pushState({}, 'Test page', options.route);
  }

  // Create services
  const transactionService = createMockTransactionService();
  const contractService = createMockContractService();
  const feedService = createMockFeedService();
  const tokenDetailService = createMockTokenDetailService();

  // Merge with any custom services
  const services = {
    transactionService,
    contractService,
    feedService,
    tokenDetailService,
    ...options?.services,
  };

  // Create wrapper with all providers
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <MockThemeProvider>
          <ServiceContext.Provider value={services}>
            {children}
          </ServiceContext.Provider>
        </MockThemeProvider>
      </BrowserRouter>
    );
  };

  return {
    user: userEvent.setup(),
    services,
    ...render(ui, { wrapper: AllTheProviders, ...options })
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method with our custom version
export { customRender as render }; 