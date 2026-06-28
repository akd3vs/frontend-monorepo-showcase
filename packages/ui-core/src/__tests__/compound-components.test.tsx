import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Card, CardLegacy } from '../components/Card';
import { Table, TableLegacy } from '../components/Table';

// ─── Table Compound Component Tests ─────────────────────────────────────────

describe('Table Compound Component', () => {
  describe('semantic HTML structure', () => {
    it('renders a <table> element with correct aria-label', () => {
      render(
        <Table ariaLabel="Test table">
          <Table.Header>
            <Table.Row>
              <Table.Cell header>Name</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Alice</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const table = screen.getByRole('table');
      expect(table).toBeDefined();
      expect(table.getAttribute('aria-label')).toBe('Test table');
    });

    it('renders Table.Header as <thead>', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Header>
            <Table.Row>
              <Table.Cell header>H</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>D</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const thead = container.querySelector('thead');
      expect(thead).not.toBeNull();
    });

    it('renders Table.Body as <tbody>', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Header>
            <Table.Row>
              <Table.Cell header>H</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>D</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const tbody = container.querySelector('tbody');
      expect(tbody).not.toBeNull();
    });

    it('renders Table.Row as <tr>', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Body>
            <Table.Row>
              <Table.Cell>Data</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const tr = container.querySelector('tr');
      expect(tr).not.toBeNull();
    });

    it('renders Table.Cell as <td> by default in body', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Body>
            <Table.Row>
              <Table.Cell>Data</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const td = container.querySelector('td');
      expect(td).not.toBeNull();
      expect(td!.textContent).toBe('Data');
    });

    it('renders Table.Cell with header prop as <th> with scope="col"', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Header>
            <Table.Row>
              <Table.Cell header>Header</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Data</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const th = container.querySelector('th');
      expect(th).not.toBeNull();
      expect(th!.textContent).toBe('Header');
      expect(th!.getAttribute('scope')).toBe('col');
    });

    it('auto-detects header cells in Table.Header section', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Header>
            <Table.Row>
              <Table.Cell>Auto Header</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Data</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const th = container.querySelector('thead th');
      expect(th).not.toBeNull();
      expect(th!.textContent).toBe('Auto Header');
    });

    it('renders Table.Footer as <tfoot>', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Header>
            <Table.Row>
              <Table.Cell header>H</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>D</Table.Cell>
            </Table.Row>
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell>Footer</Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table>,
      );

      const tfoot = container.querySelector('tfoot');
      expect(tfoot).not.toBeNull();
      expect(tfoot!.textContent).toBe('Footer');
    });

    it('renders full compound structure: table > thead > tr > th AND table > tbody > tr > td', () => {
      const { container } = render(
        <Table ariaLabel="test">
          <Table.Header>
            <Table.Row>
              <Table.Cell>H</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>D</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const table = container.querySelector('table');
      expect(table).not.toBeNull();
      expect(table!.querySelector('thead > tr > th')).not.toBeNull();
      expect(table!.querySelector('tbody > tr > td')).not.toBeNull();
    });
  });

  describe('dev-mode warnings for invalid children', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when invalid child is rendered inside Table', () => {
      render(
        <Table ariaLabel="test">
          <div>invalid</div>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Data</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Table] Invalid child component'),
      );
    });

    it('warns when invalid child is rendered inside Table.Header', () => {
      render(
        <Table ariaLabel="test">
          <Table.Header>
            <div>invalid</div>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Data</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Table.Header] Invalid child component'),
      );
    });

    it('warns when invalid child is rendered inside Table.Row', () => {
      render(
        <Table ariaLabel="test">
          <Table.Body>
            <Table.Row>
              <div>invalid</div>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Table.Row] Invalid child component'),
      );
    });

    it('does not warn when valid children are rendered', () => {
      render(
        <Table ariaLabel="test">
          <Table.Header>
            <Table.Row>
              <Table.Cell header>H</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>D</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('context isolation', () => {
    it('throws when Table.Cell is rendered outside Table', () => {
      expect(() => {
        render(<Table.Cell>x</Table.Cell>);
      }).toThrow();
    });

    it('throws when Table.Row is rendered outside Table', () => {
      expect(() => {
        render(
          <Table.Row>
            <Table.Cell>x</Table.Cell>
          </Table.Row>,
        );
      }).toThrow();
    });

    it('throws when Table.Header is rendered outside Table', () => {
      expect(() => {
        render(
          <Table.Header>
            <Table.Row>
              <Table.Cell>x</Table.Cell>
            </Table.Row>
          </Table.Header>,
        );
      }).toThrow();
    });

    it('throws when Table.Body is rendered outside Table', () => {
      expect(() => {
        render(
          <Table.Body>
            <Table.Row>
              <Table.Cell>x</Table.Cell>
            </Table.Row>
          </Table.Body>,
        );
      }).toThrow();
    });
  });
});

// ─── TableLegacy Prop-Based API Tests ───────────────────────────────────────

describe('TableLegacy prop-based API', () => {
  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
  ];

  const data = [
    { name: 'Alice', age: '30' },
    { name: 'Bob', age: '25' },
  ];

  it('renders a table with correct structure', () => {
    const { container } = render(
      <TableLegacy columns={columns} data={data} ariaLabel="People table" />,
    );

    const table = screen.getByRole('table');
    expect(table).toBeDefined();
    expect(table.getAttribute('aria-label')).toBe('People table');

    // Headers
    const headers = container.querySelectorAll('th');
    expect(headers).toHaveLength(2);
    expect(headers[0]!.textContent).toBe('Name');
    expect(headers[1]!.textContent).toBe('Age');

    // Data cells
    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(4);
    expect(cells[0]!.textContent).toBe('Alice');
    expect(cells[1]!.textContent).toBe('30');
    expect(cells[2]!.textContent).toBe('Bob');
    expect(cells[3]!.textContent).toBe('25');
  });

  it('renders header cells with scope="col"', () => {
    const { container } = render(
      <TableLegacy columns={columns} data={data} ariaLabel="test" />,
    );

    const headers = container.querySelectorAll('th');
    headers.forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });
  });

  it('uses custom render function for cell content', () => {
    const columnsWithRender = [
      {
        key: 'name',
        header: 'Name',
        render: (val: unknown) => <strong>{String(val)}</strong>,
      },
    ];

    render(
      <TableLegacy
        columns={columnsWithRender}
        data={[{ name: 'Charlie' }]}
        ariaLabel="Custom render"
      />,
    );

    const strong = screen.getByText('Charlie');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders empty table body when data is empty', () => {
    const { container } = render(
      <TableLegacy columns={columns} data={[]} ariaLabel="Empty table" />,
    );

    const tbody = container.querySelector('tbody');
    expect(tbody).not.toBeNull();
    expect(tbody!.querySelectorAll('tr')).toHaveLength(0);
  });
});

// ─── Card Compound Component Tests ──────────────────────────────────────────

describe('Card Compound Component', () => {
  describe('semantic HTML structure', () => {
    it('renders as <article> element', () => {
      render(
        <Card>
          <Card.Body>Content</Card.Body>
        </Card>,
      );

      expect(screen.getByRole('article')).toBeDefined();
    });

    it('renders Card.Header as <header>', () => {
      const { container } = render(
        <Card>
          <Card.Header>Title</Card.Header>
          <Card.Body>Content</Card.Body>
        </Card>,
      );

      const header = container.querySelector('header');
      expect(header).not.toBeNull();
      expect(header!.textContent).toBe('Title');
    });

    it('renders Card.Body as <div>', () => {
      const { container } = render(
        <Card>
          <Card.Body>Body content</Card.Body>
        </Card>,
      );

      const article = container.querySelector('article');
      expect(article).not.toBeNull();
      // Body is rendered as a div inside article
      const body = article!.querySelector('div');
      expect(body).not.toBeNull();
      expect(body!.textContent).toBe('Body content');
    });

    it('renders Card.Footer as <footer>', () => {
      const { container } = render(
        <Card>
          <Card.Body>Content</Card.Body>
          <Card.Footer>Footer content</Card.Footer>
        </Card>,
      );

      const footer = container.querySelector('footer');
      expect(footer).not.toBeNull();
      expect(footer!.textContent).toBe('Footer content');
    });

    it('renders full compound structure: article > header + div + footer', () => {
      const { container } = render(
        <Card>
          <Card.Header>Header</Card.Header>
          <Card.Body>Body</Card.Body>
          <Card.Footer>Footer</Card.Footer>
        </Card>,
      );

      const article = container.querySelector('article');
      expect(article).not.toBeNull();
      expect(article!.querySelector('header')).not.toBeNull();
      expect(article!.querySelector('footer')).not.toBeNull();
      // Body is a div
      expect(article!.textContent).toContain('Header');
      expect(article!.textContent).toContain('Body');
      expect(article!.textContent).toContain('Footer');
    });

    it('supports Card.Actions sub-component', () => {
      const { container } = render(
        <Card>
          <Card.Body>Content</Card.Body>
          <Card.Actions>
            <button>Save</button>
          </Card.Actions>
        </Card>,
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
      // Actions renders as a div
      const article = container.querySelector('article');
      expect(article).not.toBeNull();
    });
  });

  describe('dev-mode warnings for invalid children', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when invalid child is rendered inside Card', () => {
      render(
        <Card>
          <div>invalid child</div>
          <Card.Body>Content</Card.Body>
        </Card>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Card] Invalid child component'),
      );
    });

    it('does not warn when valid children are rendered', () => {
      render(
        <Card>
          <Card.Header>Header</Card.Header>
          <Card.Body>Body</Card.Body>
          <Card.Footer>Footer</Card.Footer>
        </Card>,
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('context isolation', () => {
    it('throws when Card.Header is rendered outside Card', () => {
      expect(() => {
        render(<Card.Header>x</Card.Header>);
      }).toThrow();
    });

    it('throws when Card.Body is rendered outside Card', () => {
      expect(() => {
        render(<Card.Body>x</Card.Body>);
      }).toThrow();
    });

    it('throws when Card.Footer is rendered outside Card', () => {
      expect(() => {
        render(<Card.Footer>x</Card.Footer>);
      }).toThrow();
    });

    it('throws when Card.Actions is rendered outside Card', () => {
      expect(() => {
        render(<Card.Actions>x</Card.Actions>);
      }).toThrow();
    });
  });
});

// ─── CardLegacy Prop-Based API Tests ────────────────────────────────────────

describe('CardLegacy prop-based API', () => {
  it('renders as <article> element', () => {
    render(<CardLegacy>Content</CardLegacy>);
    expect(screen.getByRole('article')).toBeDefined();
  });

  it('renders title in <header> via Card.Header', () => {
    const { container } = render(
      <CardLegacy title="My Title">Content</CardLegacy>,
    );

    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header!.textContent).toContain('My Title');
  });

  it('renders body content', () => {
    render(<CardLegacy>Body content</CardLegacy>);
    expect(screen.getByText('Body content')).toBeDefined();
  });

  it('renders footer in <footer> via Card.Footer', () => {
    const { container } = render(
      <CardLegacy footer={<span>Footer content</span>}>Body</CardLegacy>,
    );

    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer!.textContent).toBe('Footer content');
  });

  it('renders full legacy structure: article > header + body div + footer', () => {
    const { container } = render(
      <CardLegacy title="Title" footer={<span>Foot</span>}>
        Body
      </CardLegacy>,
    );

    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article!.querySelector('header')).not.toBeNull();
    expect(article!.querySelector('footer')).not.toBeNull();
  });

  it('omits header when no title is provided', () => {
    const { container } = render(<CardLegacy>Just body</CardLegacy>);

    const header = container.querySelector('header');
    expect(header).toBeNull();
  });

  it('omits footer when no footer is provided', () => {
    const { container } = render(<CardLegacy title="Title">Body</CardLegacy>);

    const footer = container.querySelector('footer');
    expect(footer).toBeNull();
  });

  it('applies aria-label from title', () => {
    render(<CardLegacy title="My Card">Content</CardLegacy>);

    const article = screen.getByRole('article');
    expect(article.getAttribute('aria-label')).toBe('My Card');
  });

  it('uses explicit aria-label over title', () => {
    render(
      <CardLegacy title="My Card" aria-label="Custom label">
        Content
      </CardLegacy>,
    );

    const article = screen.getByRole('article');
    expect(article.getAttribute('aria-label')).toBe('Custom label');
  });
});
