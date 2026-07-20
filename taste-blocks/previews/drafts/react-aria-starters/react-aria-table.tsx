'use client';

import {Cell, Column, Row, Table, TableBody, TableHeader} from '@/registry/sources/react-aria-starters/components/react-aria-table/Table';

export default function Preview() {
  return (
    <Table aria-label="Project status" selectionMode="multiple">
      <TableHeader>
        <Column isRowHeader allowsSorting>Name</Column>
        <Column>Status</Column>
      </TableHeader>
      <TableBody>
        <Row id="atlas"><Cell>Atlas</Cell><Cell>Active</Cell></Row>
        <Row id="ember"><Cell>Ember</Cell><Cell>Paused</Cell></Row>
      </TableBody>
    </Table>
  );
}
