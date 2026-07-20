"use client"

import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/confirmation";

export default function ConfirmationPreview() {
  return (
    <Confirmation
      approval={{ id: "review-change" }}
      className="w-full max-w-lg"
      state="approval-requested"
    >
      <ConfirmationTitle>
        <ConfirmationRequest>
          Apply the reviewed changes to three files?
        </ConfirmationRequest>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction variant="outline">Cancel</ConfirmationAction>
        <ConfirmationAction>Apply</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}
