import { describe, it, expect } from 'vitest';
import { compile } from './index';

describe('compiler', () => {
  it('should compile simple variable interpolation', () => {
    const template = compile('Hello {{ name }}!');
    const result = template.render({ name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('should compile multiple variables', () => {
    const template = compile('{{ firstName }} {{ lastName }}');
    const result = template.render({ firstName: 'John', lastName: 'Doe' });
    expect(result).toBe('John Doe');
  });

  it('should handle if conditionals', () => {
    const template = compile('{{#if show}}Hello{{/if}}');
    expect(template.render({ show: true })).toBe('Hello');
    expect(template.render({ show: false })).toBe('');
  });

  it('should handle each loops', () => {
    const template = compile('{{#each items as item}}{{ item }}{{/each}}');
    const result = template.render({ items: ['a', 'b', 'c'] });
    expect(result).toBe('abc');
  });

  it('should handle each with index', () => {
    const template = compile('{{#each items as item i}}{{ i }}:{{ item }}{{/each}}');
    const result = template.render({ items: ['a', 'b'] });
    expect(result).toBe('0:a1:b');
  });

  it('should handle with blocks', () => {
    const template = compile('{{#with user}}{{ name }} is {{ age }} years old{{/with}}');
    const result = template.render({ user: { name: 'John', age: 30 } });
    expect(result).toBe('John is 30 years old');
  });

  it('should handle nested structures', () => {
    const template = compile(`
      {{#if show}}
        {{#each items as item}}
          {{ item }}
        {{/each}}
      {{/if}}
    `);
    const result = template.render({ show: true, items: ['a', 'b'] });
    expect(result.trim()).toContain('a');
    expect(result.trim()).toContain('b');
  });

  it('should handle empty values', () => {
    const template = compile('Hello {{ name }}!');
    const result = template.render({});
    expect(result).toBe('Hello !');
  });
});

