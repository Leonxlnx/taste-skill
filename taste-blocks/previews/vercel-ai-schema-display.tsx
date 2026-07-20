"use client"

import {
  SchemaDisplay,
  SchemaDisplayContent,
  SchemaDisplayDescription,
  SchemaDisplayHeader,
  SchemaDisplayMethod,
  SchemaDisplayParameters,
  SchemaDisplayPath,
  SchemaDisplayRequest,
  SchemaDisplayResponse,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/schema-display";

export default function SchemaDisplayPreview() {
  return (
    <SchemaDisplay
      className="w-full max-w-2xl"
      description="Create a review entry for the selected component."
      method="POST"
      parameters={[
        { location: "path", name: "componentId", required: true, type: "string" },
        { location: "query", name: "publish", type: "boolean" },
      ]}
      path="/components/{componentId}/reviews"
      requestBody={[
        { name: "status", required: true, type: "string" },
        { name: "notes", type: "string" },
      ]}
      responseBody={[
        { name: "id", required: true, type: "string" },
        { name: "createdAt", required: true, type: "string" },
      ]}
    >
      <SchemaDisplayHeader>
        <SchemaDisplayMethod />
        <SchemaDisplayPath />
      </SchemaDisplayHeader>
      <SchemaDisplayDescription />
      <SchemaDisplayContent>
        <SchemaDisplayParameters />
        <SchemaDisplayRequest />
        <SchemaDisplayResponse />
      </SchemaDisplayContent>
    </SchemaDisplay>
  );
}
