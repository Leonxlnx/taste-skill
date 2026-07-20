import { Augmentation, Component, Module, Node, Plugin } from "./types.js";
import { MODULE_CONTROLLER } from "./consts.js";

export function createModule(name: string, component: Component): Module {
  return { name, component };
}

export function createNode(module: Module, children?: Node[]): Node {
  return { module, children };
}

function traverseNode(node: Node, target: string, apply: (node: Node) => Node[] | undefined): Node[] | undefined {
  if (node.module.name === target) {
    return apply(node);
  }
  if (node.children) {
    return [
      createNode(
        node.module,
        node.children.flatMap((n) => traverseNode(n, target, apply) ?? []),
      ),
    ];
  }
  return [node];
}

function traverse(nodes: Node[], target: string, apply: (node: Node) => Node[] | undefined): Node[] {
  return nodes.flatMap((node) => traverseNode(node, target, apply) ?? []);
}

export function withPlugins(
  root: Node[],
  plugins: readonly Plugin[] = [],
  augmentations: Augmentation[] = [],
): { config: Node[]; augmentation: Augmentation } {
  let config = root;

  const contains = (target: string) => {
    const nodes = [...config];
    while (nodes.length > 0) {
      const node = nodes.pop();
      if (node?.module.name === target) return true;
      if (node?.children) nodes.push(...node.children);
    }
    return false;
  };

  const addParent = (target: string, module: Module) => {
    if (target === "") {
      config = [createNode(module, config)];
      return;
    }
    config = traverse(config, target, (node) => [createNode(module, [node])]);
  };

  const append = (target: string, module: Module) => {
    config = traverse(config, target, (node) => [createNode(node.module, [createNode(module, node.children)])]);
  };

  const addChild = (target: string, module: Module, precede?: boolean) => {
    config = traverse(config, target, (node) => [
      createNode(node.module, [
        ...(precede ? [createNode(module)] : []),
        ...(node.children ?? []),
        ...(!precede ? [createNode(module)] : []),
      ]),
    ]);
  };

  const addSibling = (target: string, module: Module, precede?: boolean) => {
    config = traverse(config, target, (node) => [
      ...(precede ? [createNode(module)] : []),
      node,
      ...(!precede ? [createNode(module)] : []),
    ]);
  };

  const addModule = (module: Module) => {
    append(MODULE_CONTROLLER, module);
  };

  const replace = (target: string, module: Module) => {
    config = traverse(config, target, (node) => [createNode(module, node.children)]);
  };

  const remove = (target: string) => {
    config = traverse(config, target, (node) => node.children);
  };

  const augment = (augmentation: Augmentation) => {
    augmentations.push(augmentation);
  };

  plugins.forEach((plugin) => {
    plugin({
      contains,
      addParent,
      append,
      addChild,
      addSibling,
      addModule,
      replace,
      remove,
      augment,
    });
  });

  return {
    config,
    augmentation: (props) => augmentations.reduce((acc, augmentation) => augmentation(acc), props),
  };
}
