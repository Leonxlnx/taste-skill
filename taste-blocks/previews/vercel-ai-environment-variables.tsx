"use client"

import {
  EnvironmentVariable,
  EnvironmentVariableCopyButton,
  EnvironmentVariableGroup,
  EnvironmentVariableName,
  EnvironmentVariableRequired,
  EnvironmentVariables,
  EnvironmentVariablesContent,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesToggle,
  EnvironmentVariableValue,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/environment-variables";

const variables = [
  { name: "PROJECT_URL", required: true, value: "http://127.0.0.1:3000" },
  { name: "LOG_LEVEL", required: false, value: "info" },
  { name: "REGION", required: false, value: "eu-central" },
];

export default function EnvironmentVariablesPreview() {
  return (
    <EnvironmentVariables className="w-full max-w-xl" defaultShowValues={false}>
      <EnvironmentVariablesHeader>
        <EnvironmentVariablesTitle />
        <EnvironmentVariablesToggle />
      </EnvironmentVariablesHeader>
      <EnvironmentVariablesContent>
        {variables.map((variable) => (
          <EnvironmentVariable key={variable.name} name={variable.name} value={variable.value}>
            <EnvironmentVariableGroup>
              <EnvironmentVariableName />
              {variable.required ? <EnvironmentVariableRequired /> : null}
            </EnvironmentVariableGroup>
            <EnvironmentVariableGroup>
              <EnvironmentVariableValue />
              <EnvironmentVariableCopyButton copyFormat="export" />
            </EnvironmentVariableGroup>
          </EnvironmentVariable>
        ))}
      </EnvironmentVariablesContent>
    </EnvironmentVariables>
  );
}
