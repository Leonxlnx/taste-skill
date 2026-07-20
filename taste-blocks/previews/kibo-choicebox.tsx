"use client"

"use client"

import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
  ChoiceboxItemDescription,
  ChoiceboxItemHeader,
  ChoiceboxItemSubtitle,
  ChoiceboxItemTitle,
} from "@/registry/sources/kibo-ui/components/kibo-choicebox"

const options = [
  {
    value: "quiet",
    title: "Quiet",
    subtitle: "Only essential alerts",
    description: "Receive notices when an action needs your attention.",
  },
  {
    value: "standard",
    title: "Standard",
    subtitle: "Recommended",
    description: "Receive important updates and weekly summaries.",
  },
]

export default function KiboChoiceboxPreview() {
  return (
    <Choicebox className="max-w-xl gap-3" defaultValue="standard">
      {options.map((option) => (
        <ChoiceboxItem id={`choice-${option.value}`} key={option.value} value={option.value}>
          <ChoiceboxItemHeader>
            <ChoiceboxItemTitle>
              {option.title}
              <ChoiceboxItemSubtitle>{option.subtitle}</ChoiceboxItemSubtitle>
            </ChoiceboxItemTitle>
            <ChoiceboxItemDescription>{option.description}</ChoiceboxItemDescription>
          </ChoiceboxItemHeader>
          <ChoiceboxIndicator />
        </ChoiceboxItem>
      ))}
    </Choicebox>
  )
}
