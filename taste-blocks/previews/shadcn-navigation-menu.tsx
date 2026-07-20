"use client"

"use client"

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/registry/sources/shadcn-ui/components/radix-nova/navigation-menu"

export default function Preview() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-72 gap-2 p-3">
              <NavigationMenuLink
                href="https://ui.shadcn.com/docs/components/radix/navigation-menu"
                target="_blank"
                rel="noreferrer"
              >
                Documentation
              </NavigationMenuLink>
              <NavigationMenuLink
                href="https://ui.shadcn.com/docs/components"
                target="_blank"
                rel="noreferrer"
              >
                Examples
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="https://ui.shadcn.com/docs"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
