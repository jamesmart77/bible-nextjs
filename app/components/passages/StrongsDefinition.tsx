import { createElement, type ReactNode } from "react";
import type { DefinitionNode, StrongsEntry } from "@/lib/interlinear/types";
import styles from "./StrongsDefinition.module.css";

function renderNodes(nodes: DefinitionNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.text;
    return createElement(
      node.tag,
      { key: index, ...(node.tag === "ol" ? { type: node.listType, "data-list-type": node.listType } : {}) },
      ...renderNodes(node.children),
    );
  });
}

export default function StrongsDefinition({ entry }: { entry: StrongsEntry }) {
  return (
    <div className={styles.definition}>
      {entry.definitionContent
        ? renderNodes(entry.definitionContent)
        : <p style={{ whiteSpace: "pre-line" }}>{entry.definition}</p>}
    </div>
  );
}
