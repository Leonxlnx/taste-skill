"use client"

"use client"

import { useState } from "react"

import ResponsivePagination, {
  dropNavThenEllipsis,
} from "@/registry/sources/react-responsive-pagination/components/react-responsive-pagination"

const copy = {
  en: {
    current: "current page",
    direction: "Show Arabic right-to-left labels",
    goTo: "Go to page",
    navigation: "Results pages",
    next: "Next page",
    page: "Page",
    previous: "Previous page",
    status: "Page",
  },
  ar: {
    current: "الصفحة الحالية",
    direction: "عرض التسميات الإنجليزية من اليسار إلى اليمين",
    goTo: "انتقل إلى الصفحة",
    navigation: "صفحات النتائج",
    next: "الصفحة التالية",
    page: "الصفحة",
    previous: "الصفحة السابقة",
    status: "الصفحة",
  },
} as const

export default function ReactResponsivePaginationPreview() {
  const [current, setCurrent] = useState(12)
  const [isNarrow, setIsNarrow] = useState(true)
  const [locale, setLocale] = useState<keyof typeof copy>("en")
  const labels = copy[locale]
  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <section className="grid justify-items-center gap-5">
      <p aria-live="polite" className="text-sm text-neutral-600">
        {labels.status} {current} / 24
      </p>

      <div
        className="w-full"
        style={{ maxWidth: isNarrow ? 300 : 620 }}
      >
        <ResponsivePagination
          ariaNextLabel={labels.next}
          ariaPageLabel={(page, active) =>
            active
              ? `${labels.page} ${page}, ${labels.current}`
              : `${labels.goTo} ${page}`
          }
          ariaPreviousLabel={labels.previous}
          current={current}
          direction={direction}
          linkHref={(page) => `?page=${page}`}
          narrowBehaviour={dropNavThenEllipsis}
          navigationLabel={labels.navigation}
          onPageChange={setCurrent}
          total={24}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          aria-pressed={isNarrow}
          className="min-h-11 rounded-full border border-neutral-300 bg-white px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setIsNarrow((value) => !value)}
          type="button"
        >
          {isNarrow ? "Use wide container" : "Use narrow container"}
        </button>
        <button
          aria-pressed={locale === "ar"}
          className="min-h-11 rounded-full border border-neutral-300 bg-white px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setLocale((value) => (value === "en" ? "ar" : "en"))}
          type="button"
        >
          {labels.direction}
        </button>
      </div>
    </section>
  )
}
