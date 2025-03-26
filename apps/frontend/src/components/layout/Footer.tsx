export function Footer() {
  return (
    <footer className="bg-card text-muted-foreground py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-foreground text-lg font-bold">LoanChain</h2>
            <p className="text-sm mt-1">
              A decentralized lending platform on Moonbeam
            </p>
          </div>

          <div className="text-sm">
            <p>© {new Date().getFullYear()} LoanChain. All rights reserved.</p>
            <p className="mt-1">Built with ❤️ on Moonbeam</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
