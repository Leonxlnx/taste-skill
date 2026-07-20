"use client"

"use client"

import {
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputCountrySelectContent,
  PhoneInputCountrySelectOptions,
  PhoneInputCountrySelectValue,
  PhoneInputInput,
} from "@/registry/sources/ui-x/components/ui-x/phone-input"
import { SelectTrigger } from "@/components/ui/select"

export default function UiXPhoneInputPreview() {
  return (
    <div className="flex min-h-64 items-center justify-center p-6">
      <PhoneInput preferredCountry="US">
        <div className="flex w-full max-w-sm items-stretch">
          <PhoneInputCountrySelect>
            <SelectTrigger aria-label="Country" className="w-20 rounded-r-none border-r-0">
              <PhoneInputCountrySelectValue />
            </SelectTrigger>
            <PhoneInputCountrySelectContent>
              <PhoneInputCountrySelectOptions />
            </PhoneInputCountrySelectContent>
          </PhoneInputCountrySelect>
          <PhoneInputInput aria-label="Phone number" className="rounded-l-none" />
        </div>
      </PhoneInput>
    </div>
  )
}
