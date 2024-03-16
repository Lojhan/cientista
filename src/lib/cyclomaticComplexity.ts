import * as esprima from 'esprima';

export function checkCyclomaticComplexity(func: Function) {
  let complexity = 1;

  function visitNode(node: any) {
    if (!node) return;

    switch (node.type) {
      case 'IfStatement':
      case 'ConditionalExpression':
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
      case 'SwitchStatement':
        complexity++;
        break;
      case 'BinaryExpression':
        if (node.operator === '&&' || node.operator === '||') {
          complexity++;
        }
        break;
    }

    // Recursively visit child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key) && typeof node[key] === 'object') {
        visitNode(node[key]);
      }
    }
  }

  const funcString = func.toString();
  const ast = esprima.parseScript(funcString);
  visitNode(ast);
  return complexity;
}

export function compareCyclomaticComplexity(a: number, b: number) {
  return a - b;
}
