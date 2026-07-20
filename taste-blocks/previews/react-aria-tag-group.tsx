'use client';

import {Tag, TagGroup} from '@/registry/sources/react-aria-starters/components/react-aria-tag-group/TagGroup';

export default function Preview() {
  return (
    <TagGroup label="Filters" selectionMode="multiple" onRemove={() => {}}>
      <Tag id="design">Design</Tag>
      <Tag id="motion">Motion</Tag>
      <Tag id="code">Code</Tag>
    </TagGroup>
  );
}
