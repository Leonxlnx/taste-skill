'use client';

import {Disclosure, DisclosureHeader, DisclosurePanel} from '@/registry/sources/react-aria-starters/components/react-aria-disclosure-group/Disclosure';
import {DisclosureGroup} from '@/registry/sources/react-aria-starters/components/react-aria-disclosure-group/DisclosureGroup';

export default function Preview() {
  return (
    <DisclosureGroup>
      <Disclosure id="details">
        <DisclosureHeader>Project details</DisclosureHeader>
        <DisclosurePanel>Scope, owners, and delivery notes.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="access">
        <DisclosureHeader>Access</DisclosureHeader>
        <DisclosurePanel>Members can view and comment.</DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}
