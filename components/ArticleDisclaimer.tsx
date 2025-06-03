interface ArticleDisclaimerProps {
  type: 'medical' | 'financial' | 'both'
}

export default function ArticleDisclaimer({ type }: ArticleDisclaimerProps) {
  const medicalDisclaimer = (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Medical Disclaimer
      </h4>
      <p className="text-sm text-yellow-700 dark:text-yellow-300">
        This article is for informational purposes only and should not be considered medical advice. 
        Always consult with a qualified healthcare provider or certified voice therapist before making 
        any changes to your health routine or if you have concerns about your vocal health. The 
        information presented here is based on research but may not apply to your individual circumstances.
      </p>
    </div>
  )

  const financialDisclaimer = (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Financial Disclaimer
      </h4>
      <p className="text-sm text-blue-700 dark:text-blue-300">
        This article contains general information about business practices and pricing strategies. 
        It should not be considered financial or business advice. Pricing and business decisions 
        should be based on your specific circumstances, market conditions, and professional consultation. 
        Results may vary, and past performance does not guarantee future results.
      </p>
    </div>
  )

  if (type === 'both') {
    return (
      <>
        {medicalDisclaimer}
        {financialDisclaimer}
      </>
    )
  }

  return type === 'medical' ? medicalDisclaimer : financialDisclaimer
}