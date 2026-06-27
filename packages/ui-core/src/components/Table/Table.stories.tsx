import { Table } from './index';

import type { TableColumn } from './index';
import type { Meta, StoryObj } from '@storybook/react';

type Row = Record<string, unknown>;

const sampleColumns: TableColumn<Row>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
];

const sampleData: Row[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer' },
  { id: 4, name: 'Diana Lee', email: 'diana@example.com', role: 'Editor' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin' },
];

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
};

export default meta;
type Story = StoryObj<typeof Table>;

export const BasicTable: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
    ariaLabel: 'User list',
  },
};

export const EmptyTable: Story = {
  args: {
    columns: sampleColumns,
    data: [],
    ariaLabel: 'Empty user list',
  },
};

const manyColumns: TableColumn<Row>[] = [
  { key: 'ticker', header: 'Ticker' },
  { key: 'quantity', header: 'Quantity' },
  { key: 'price', header: 'Price' },
  { key: 'total', header: 'Total Value' },
  { key: 'currency', header: 'Currency' },
  { key: 'exchange', header: 'Exchange' },
  { key: 'sector', header: 'Sector' },
  { key: 'change', header: '24h Change' },
];

const wideData: Row[] = [
  { ticker: 'AAPL', quantity: 100, price: 189.50, total: 18950.00, currency: 'USD', exchange: 'NASDAQ', sector: 'Technology', change: 1.25 },
  { ticker: 'GOOGL', quantity: 50, price: 141.80, total: 7090.00, currency: 'USD', exchange: 'NASDAQ', sector: 'Technology', change: -0.83 },
  { ticker: 'TSLA', quantity: 75, price: 248.30, total: 18622.50, currency: 'USD', exchange: 'NASDAQ', sector: 'Automotive', change: 3.14 },
];

export const ManyColumns: Story = {
  args: {
    columns: manyColumns,
    data: wideData,
    ariaLabel: 'Stock portfolio with many columns',
  },
};
