# LoanToken Contract Tests

This directory contains comprehensive tests for the LoanToken contract using the Foundry testing framework.

## Test Files

1. **LoanToken.t.sol** - Core functionality tests for the LoanToken contract
   - Basic initialization tests
   - Minting functionality
   - Token enumeration and queries
   - Status updates
   - URI and metadata management
   - Permission checks and role-based access control

2. **LoanTokenExtended.t.sol** - Extended functionality and edge case tests
   - Role management (granting, revoking, renouncing)
   - Complete loan lifecycle tests
   - Loan terms updates
   - Base URI updates
   - Past due date handling
   - Batch minting scenarios

3. **LoanTokenTransaction.t.sol** - Transaction and gas usage tests
   - Gas usage for minting tokens
   - Gas usage for updating loan status
   - Multiple transactions in a single block
   - Transaction reversion behavior
   - Token transfer functionality

## Test Coverage

The tests cover:
- 100% of contract functions
- All state transitions and lifecycle events
- Access control and permissions
- Edge cases and failure scenarios
- Gas usage and optimization

Total test count: 26 passing tests

## Running Tests

To run all tests:
```bash
forge test
```

To run tests with gas reporting:
```bash
forge test --gas-report
```

To run specific test file:
```bash
forge test --match-path test/LoanToken.t.sol
forge test --match-path test/LoanTokenExtended.t.sol
forge test --match-path test/LoanTokenTransaction.t.sol
```

To run specific test function:
```bash
forge test --match-test test_Initialization
```

## Test Approach

These tests follow a comprehensive strategy:
1. **Unit Testing** - Testing individual functions in isolation
2. **Integration Testing** - Testing interactions between functions
3. **Gas Optimization** - Monitoring gas usage for key operations
4. **Access Control** - Ensuring proper role-based access
5. **Error Handling** - Validating proper reversion on invalid inputs or unauthorized access

## Next Steps

- Add integration tests between the smart contracts and frontend components
- Add fuzzing tests for more robust random input testing
- Add invariant tests to ensure contract properties hold under all conditions 