/**
 * Pulse Template Compiler
 * Transforms template syntax into JavaScript render functions
 */

export interface CompileOptions {
  /**
   * Whether to include source maps
   */
  sourceMap?: boolean;
  /**
   * Custom variable prefix for reactive values
   */
  reactivePrefix?: string;
}

export interface CompiledTemplate {
  /**
   * The compiled render function
   */
  render: (context: Record<string, any>) => string;
  /**
   * Source map if enabled
   */
  sourceMap?: string;
}

/**
 * Compiles a template string into a render function
 * 
 * Template syntax:
 * - {{ variable }} - interpolates a variable
 * - {{#if condition}} ... {{/if}} - conditional rendering
 * - {{#each items}} ... {{/each}} - list rendering
 * - {{#with object}} ... {{/with}} - context switching
 */
export function compile(template: string, options: CompileOptions = {}): CompiledTemplate {
  const reactivePrefix = options.reactivePrefix || '';
  
  // Simple tokenizer
  const tokens = tokenize(template);
  
  // Parse tokens into AST
  const ast = parse(tokens);
  
  // Generate render function
  const renderCode = generate(ast, reactivePrefix);
  
  // Create render function
  const render = new Function('context', renderCode) as (context: Record<string, any>) => string;
  
  return {
    render,
    ...(options.sourceMap ? { sourceMap: generateSourceMap(template, renderCode) } : {}),
  };
}

type Token = 
  | { type: 'text'; value: string }
  | { type: 'variable'; name: string }
  | { type: 'if'; condition: string }
  | { type: 'ifEnd' }
  | { type: 'each'; items: string; item: string; index?: string }
  | { type: 'eachEnd' }
  | { type: 'with'; object: string }
  | { type: 'withEnd' };

function tokenize(template: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < template.length) {
    // Look for {{ ... }}
    const start = template.indexOf('{{', i);
    if (start === -1) {
      // No more templates, add remaining text
      if (i < template.length) {
        tokens.push({ type: 'text', value: template.slice(i) });
      }
      break;
    }
    
    // Add text before template
    if (start > i) {
      tokens.push({ type: 'text', value: template.slice(i, start) });
    }
    
    // Find closing }}
    const end = template.indexOf('}}', start);
    if (end === -1) {
      throw new Error(`Unclosed template at position ${start}`);
    }
    
    const content = template.slice(start + 2, end).trim();
    
    // Parse template content
    if (content.startsWith('#if ')) {
      tokens.push({ type: 'if', condition: content.slice(4).trim() });
    } else if (content === '/if') {
      tokens.push({ type: 'ifEnd' });
    } else if (content.startsWith('#each ')) {
      const parts = content.slice(6).trim().split(' as ');
      const items = parts[0].trim();
      const itemParts = parts[1]?.trim().split(' ').filter(p => p) || [];
      const item = itemParts[0] || 'item';
      const index = itemParts[1] || undefined;
      tokens.push({ type: 'each', items, item, index });
    } else if (content === '/each') {
      tokens.push({ type: 'eachEnd' });
    } else if (content.startsWith('#with ')) {
      tokens.push({ type: 'with', object: content.slice(6).trim() });
    } else if (content === '/with') {
      tokens.push({ type: 'withEnd' });
    } else {
      // Variable interpolation
      tokens.push({ type: 'variable', name: content });
    }
    
    i = end + 2;
  }
  
  return tokens;
}

type ASTNode =
  | { type: 'text'; value: string }
  | { type: 'variable'; name: string }
  | { type: 'if'; condition: string; children: ASTNode[] }
  | { type: 'each'; items: string; item: string; index?: string; children: ASTNode[] }
  | { type: 'with'; object: string; children: ASTNode[] };

function parse(tokens: Token[]): ASTNode[] {
  const nodes: ASTNode[] = [];
  let i = 0;
  
  while (i < tokens.length) {
    const token = tokens[i];
    
    switch (token.type) {
      case 'text':
        nodes.push({ type: 'text', value: token.value });
        i++;
        break;
      case 'variable':
        nodes.push({ type: 'variable', name: token.name });
        i++;
        break;
      case 'if': {
        const children: ASTNode[] = [];
        i++; // Skip if token
        let depth = 1;
        const childTokens: Token[] = [];
        while (i < tokens.length && depth > 0) {
          const currentToken = tokens[i];
          if (currentToken.type === 'if') depth++;
          else if (currentToken.type === 'ifEnd') depth--;
          
          if (depth > 0) {
            childTokens.push(currentToken);
          }
          i++;
        }
        if (childTokens.length > 0) {
          children.push(...parse(childTokens));
        }
        nodes.push({ type: 'if', condition: token.condition, children });
        break;
      }
      case 'each': {
        const children: ASTNode[] = [];
        i++; // Skip each token
        let depth = 1;
        const childTokens: Token[] = [];
        while (i < tokens.length && depth > 0) {
          const currentToken = tokens[i];
          if (currentToken.type === 'each') depth++;
          else if (currentToken.type === 'eachEnd') depth--;
          
          if (depth > 0) {
            childTokens.push(currentToken);
          }
          i++;
        }
        if (childTokens.length > 0) {
          children.push(...parse(childTokens));
        }
        nodes.push({ type: 'each', items: token.items, item: token.item, index: token.index, children });
        break;
      }
      case 'with': {
        const children: ASTNode[] = [];
        i++; // Skip with token
        let depth = 1;
        const childTokens: Token[] = [];
        while (i < tokens.length && depth > 0) {
          const currentToken = tokens[i];
          if (currentToken.type === 'with') depth++;
          else if (currentToken.type === 'withEnd') depth--;
          
          if (depth > 0) {
            childTokens.push(currentToken);
          }
          i++;
        }
        if (childTokens.length > 0) {
          children.push(...parse(childTokens));
        }
        nodes.push({ type: 'with', object: token.object, children });
        break;
      }
      default:
        i++;
    }
  }
  
  return nodes;
}

function generate(nodes: ASTNode[], reactivePrefix: string): string {
  const parts: string[] = ['let result = "";'];
  let contextStack: string[] = ['context'];
  
  function generateNode(node: ASTNode, indent = '', localContext?: string, localVars?: Record<string, string>): void {
    const ctx = localContext || contextStack[contextStack.length - 1];
    const locals = localVars || {};
    switch (node.type) {
      case 'text':
        parts.push(`result += ${JSON.stringify(node.value)};`);
        break;
      case 'variable':
        // Check if variable is a local (loop item/index) first
        if (locals[node.name]) {
          parts.push(`result += String(${locals[node.name]});`);
        } else {
          parts.push(`result += String(${ctx}.${node.name} ?? "");`);
        }
        break;
      case 'if':
        parts.push(`if (${ctx}.${node.condition}) {`);
        node.children.forEach((child) => generateNode(child, indent + '  ', localContext, locals));
        parts.push(`}`);
        break;
      case 'each': {
        const indexVar = node.index || 'i';
        const itemsVar = `${node.items}_arr`;
        parts.push(`const ${itemsVar} = context.${node.items} || [];`);
        parts.push(`for (let ${indexVar} = 0; ${indexVar} < ${itemsVar}.length; ${indexVar}++) {`);
        parts.push(`  const ${node.item} = ${itemsVar}[${indexVar}];`);
        // Create local variables map for loop item and index
        const loopLocals = { ...locals, [node.item]: node.item, [indexVar]: indexVar };
        node.children.forEach((child) => generateNode(child, indent + '  ', localContext, loopLocals));
        parts.push(`}`);
        break;
      }
      case 'with': {
        const objVar = `${node.object}_obj`;
        parts.push(`const ${objVar} = ${ctx}.${node.object} || {};`);
        contextStack.push(objVar);
        node.children.forEach((child) => generateNode(child, indent + '  ', objVar, locals));
        contextStack.pop();
        break;
      }
    }
  }
  
  nodes.forEach((node) => generateNode(node));
  parts.push('return result;');
  
  return parts.join('\n');
}

function generateSourceMap(original: string, compiled: string): string {
  // Simple source map generation
  return JSON.stringify({
    version: 3,
    sources: ['template'],
    mappings: '',
  });
}

