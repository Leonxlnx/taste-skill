"use client"

import {
  Test,
  TestError,
  TestErrorMessage,
  TestResults,
  TestResultsContent,
  TestResultsDuration,
  TestResultsHeader,
  TestResultsProgress,
  TestResultsSummary,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/test-results";

export default function TestResultsPreview() {
  return (
    <TestResults
      className="w-full max-w-2xl"
      summary={{ duration: 842, failed: 1, passed: 7, skipped: 1, total: 9 }}
    >
      <TestResultsHeader>
        <TestResultsSummary />
        <TestResultsDuration />
      </TestResultsHeader>
      <div className="border-b px-4 py-3">
        <TestResultsProgress />
      </div>
      <TestResultsContent>
        <TestSuite defaultOpen name="Interaction" status="passed">
          <TestSuiteName />
          <TestSuiteContent>
            <Test duration={42} name="supports keyboard selection" status="passed" />
            <Test duration={37} name="restores focus after close" status="passed" />
          </TestSuiteContent>
        </TestSuite>
        <TestSuite defaultOpen name="Responsive" status="failed">
          <TestSuiteName />
          <TestSuiteContent>
            <Test duration={55} name="fits a 320px viewport" status="failed">
              <TestError>
                <TestErrorMessage>Content exceeded the viewport by 8px.</TestErrorMessage>
              </TestError>
            </Test>
          </TestSuiteContent>
        </TestSuite>
      </TestResultsContent>
    </TestResults>
  );
}
