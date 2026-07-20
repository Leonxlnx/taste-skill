'use client';
import {
  Button,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  type TagGroupProps as AriaTagGroupProps,
  TagList,
  type TagListProps,
  type TagProps
} from 'react-aria-components/TagGroup';
import {Description, Label} from './Form';
import {Text} from './Content';
import {X} from 'lucide-react';
import './TagGroup.css';

export interface TagGroupProps<T>
  extends
    Omit<AriaTagGroupProps, 'children'>,
    Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'> {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function TagGroup<T>({
  label,
  description,
  errorMessage,
  items,
  children,
  renderEmptyState,
  ...props
}: TagGroupProps<T>) {
  return (
    <AriaTagGroup {...props}>
      {label && <Label>{label}</Label>}
      <TagList items={items} renderEmptyState={renderEmptyState}>
        {children}
      </TagList>
      {description && <Description>{description}</Description>}
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaTagGroup>
  );
}

export function Tag({
  children,
  ...props
}: Omit<TagProps, 'children'> & {
  children?: React.ReactNode;
}) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaTag textValue={textValue} {...props} className="react-aria-Tag button-base">
      {({allowsRemoving}) => (
        <>
          {children}
          {allowsRemoving && (
            <Button slot="remove" className="remove-button">
              <X />
            </Button>
          )}
        </>
      )}
    </AriaTag>
  );
}
