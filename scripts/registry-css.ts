import type { ChildNode, Container } from "postcss";

export interface CssObject {
  [key: string]: string | CssObject;
}

/** Collapses the newlines and indentation postcss keeps in selectors, params and values. */
const oneLine = (value: string) => value.replaceAll(/\s*\n\s*/g, " ").trim();

export const toCssObject = (
  container: Container<ChildNode>,
  file: string
): CssObject => {
  const result: CssObject = {};
  // Repeated selectors/at-rules merge like the cascade: later declarations win.
  const merge = (target: CssObject, key: string, value: CssObject) => {
    const existing = target[key];
    if (typeof existing !== "object") {
      target[key] = value;
      return;
    }
    for (const [innerKey, innerValue] of Object.entries(value)) {
      if (typeof innerValue === "object") {
        merge(existing, innerKey, innerValue);
      } else {
        existing[innerKey] = innerValue;
      }
    }
  };
  container.each((node) => {
    if (node.type === "decl") {
      if (node.prop in result) {
        console.warn(
          `build-registry: ${file}: duplicate "${node.prop}" in one rule; the css object keeps the last value`
        );
      }
      const value = oneLine(node.value);
      result[node.prop] = node.important ? `${value} !important` : value;
    } else if (node.type === "rule") {
      merge(result, oneLine(node.selector), toCssObject(node, file));
    } else if (node.type === "atrule") {
      const key = node.params
        ? `@${node.name} ${oneLine(node.params)}`
        : `@${node.name}`;
      merge(result, key, node.nodes ? toCssObject(node, file) : {});
    }
  });
  return result;
};
