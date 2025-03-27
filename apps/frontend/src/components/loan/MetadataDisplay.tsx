import { LoanMetadata } from "@/lib/contract-integration/token-detail.service";

interface MetadataDisplayProps {
  metadata: LoanMetadata;
}

export function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          BASIC INFORMATION
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <p className="text-sm font-medium">Amount:</p>
          <p className="text-sm">${metadata.amount.toLocaleString()}</p>

          <p className="text-sm font-medium">Interest Rate:</p>
          <p className="text-sm">{metadata.interestRate}%</p>

          <p className="text-sm font-medium">Term:</p>
          <p className="text-sm">{metadata.term} months</p>

          {metadata.purpose && (
            <>
              <p className="text-sm font-medium">Purpose:</p>
              <p className="text-sm">{metadata.purpose}</p>
            </>
          )}

          {metadata.collateral && (
            <>
              <p className="text-sm font-medium">Collateral:</p>
              <p className="text-sm">{metadata.collateral}</p>
            </>
          )}
          
          {metadata.dueDate && (
            <>
              <p className="text-sm font-medium">Due Date:</p>
              <p className="text-sm">
                {new Date(metadata.dueDate).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      {(metadata.riskAssessment || metadata.riskScore !== undefined) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            RISK ASSESSMENT
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {metadata.riskAssessment && (
              <>
                <p className="text-sm font-medium">Risk Assessment:</p>
                <p className="text-sm">{metadata.riskAssessment}</p>
              </>
            )}

            {metadata.riskScore !== undefined && (
              <>
                <p className="text-sm font-medium">Risk Score:</p>
                <p className="text-sm">{metadata.riskScore}/100</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {metadata.tags && metadata.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            TAGS
          </h3>
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 