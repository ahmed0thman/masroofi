import { buildWhereClause, ExpenseFilters } from '@/db/expense-repo';

describe('buildWhereClause', () => {
  it('returns empty WHERE for empty filters', () => {
    const result = buildWhereClause({});
    expect(result.where).toBe('');
    expect(result.params).toEqual([]);
  });

  it('builds search filter with LIKE on item_name, description, and merchant_name', () => {
    const filters: ExpenseFilters = { search: 'خبز' };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('WHERE');
    expect(result.where).toContain('e.item_name LIKE ?');
    expect(result.where).toContain('e.description LIKE ?');
    expect(result.where).toContain('m.name LIKE ?');
    expect(result.params).toEqual(['%خبز%', '%خبز%', '%خبز%']);
  });

  it('builds category_id filter', () => {
    const filters: ExpenseFilters = { category_id: 5 };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('e.category_id = ?');
    expect(result.params).toEqual([5]);
  });

  it('builds sub_category_id filter', () => {
    const filters: ExpenseFilters = { sub_category_id: 10 };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('e.sub_category_id = ?');
    expect(result.params).toEqual([10]);
  });

  it('builds dateFrom filter', () => {
    const filters: ExpenseFilters = { dateFrom: '2025-01-01' };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('e.created_at >= ?');
    expect(result.params).toEqual(['2025-01-01']);
  });

  it('builds dateTo filter with end-of-day suffix', () => {
    const filters: ExpenseFilters = { dateTo: '2025-01-31' };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('e.created_at <= ?');
    expect(result.params).toEqual(['2025-01-31T23:59:59.999Z']);
  });

  it('builds priceMin filter', () => {
    const filters: ExpenseFilters = { priceMin: 100 };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('e.price >= ?');
    expect(result.params).toEqual([100]);
  });

  it('builds priceMax filter', () => {
    const filters: ExpenseFilters = { priceMax: 5000 };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('e.price <= ?');
    expect(result.params).toEqual([5000]);
  });

  it('combines all filters with AND', () => {
    const filters: ExpenseFilters = {
      search: 'خبز',
      category_id: 3,
      sub_category_id: 7,
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
      priceMin: 10,
      priceMax: 1000,
    };
    const result = buildWhereClause(filters);
    expect(result.where).toContain('WHERE');
    expect(result.where).toContain('AND');
    expect(result.where).toMatch(/e\.item_name LIKE \?/);
    expect(result.where).toMatch(/e\.category_id = \?/);
    expect(result.where).toMatch(/e\.sub_category_id = \?/);
    expect(result.where).toMatch(/e\.created_at >= \?/);
    expect(result.where).toMatch(/e\.created_at <= \?/);
    expect(result.where).toMatch(/e\.price >= \?/);
    expect(result.where).toMatch(/e\.price <= \?/);
    expect(result.params).toHaveLength(9);
  });

  it('handles search with special regex characters', () => {
    const filters: ExpenseFilters = { search: 'test_with_underscores' };
    const result = buildWhereClause(filters);
    expect(result.params).toEqual([
      '%test_with_underscores%',
      '%test_with_underscores%',
      '%test_with_underscores%',
    ]);
  });

  it('handles undefined priceMin as not adding the condition', () => {
    const filters: ExpenseFilters = { priceMin: undefined, priceMax: 500 } as any;
    const result = buildWhereClause(filters);
    // priceMax should be there, priceMin should not
    expect(result.where).toContain('e.price <= ?');
    expect(result.where).not.toContain('e.price >= ?');
  });

  it('handles undefined priceMax as not adding the condition', () => {
    const filters: ExpenseFilters = { priceMin: 100, priceMax: undefined } as any;
    const result = buildWhereClause(filters);
    expect(result.where).toContain('e.price >= ?');
    expect(result.where).not.toContain('e.price <= ?');
  });
});
