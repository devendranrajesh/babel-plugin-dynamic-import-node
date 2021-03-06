import syntax from 'babel-plugin-syntax-dynamic-import';

export default function ({ template, types: t }) {
  const buildImport = template('Promise.resolve().then(() => MODULE)');

  return {
    inherits: syntax,

    visitor: {
      Import(path) {
        const importArguments = path.parentPath.node.arguments;
        const [importPath] = importArguments;
        const isString = t.isStringLiteral(importPath) || t.isTemplateLiteral(importPath);
        if (isString) {
          t.removeComments(importPath);
        }
        const SOURCE = isString
          ? importArguments
          : t.templateLiteral([
            t.templateElement({ raw: '', cooked: '' }),
            t.templateElement({ raw: '', cooked: '' }, true),
          ], importArguments);
        const requireCall = t.callExpression(
          t.identifier('require'),
          [].concat(SOURCE),
        );
        const newImport = buildImport({
          MODULE: t.callExpression(this.addHelper('interopRequireWildcard'), [requireCall]),
        });
        path.parentPath.replaceWith(newImport);
      },
    },
  };
}
