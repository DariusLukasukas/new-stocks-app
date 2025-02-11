"use client";

export class TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  endOfWordData: T[];

  constructor() {
    this.children = new Map<string, TrieNode<T>>();
    this.endOfWordData = [];
  }
}

export class Trie<T> {
  root: TrieNode<T>;

  constructor() {
    this.root = new TrieNode<T>();
  }

  /**
   * Insert a word into the Trie (already normalized to lowerCase).
   */
  insert(word: string, data: T): void {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode<T>());
      }
      node = node.children.get(char)!;
    }

    node.endOfWordData.push(data);
  }

  /**
   * Return the node at the end of `prefix`, or undefined if not found.
   */
  private getNode(prefix: string): TrieNode<T> | undefined {
    let node = this.root;

    for (const char of prefix) {
      const child = node.children.get(char);
      if (!child) {
        return undefined;
      }
      node = child;
    }

    return node;
  }

  /**
   * Recursively gather `endOfWordData` from this node and all children,
   * up to `limit` results total.
   */
  private collectAllData(node: TrieNode<T>, results: T[], limit: number) {
    if (results.length >= limit) return;

    // Add any data stored in this node
    if (node.endOfWordData.length > 0) {
      results.push(...node.endOfWordData);
    }

    // Traverse children
    for (const childNode of node.children.values()) {
      if (results.length >= limit) break;
      this.collectAllData(childNode, results, limit);
    }
  }

  /**
   * Return up to `limit` items that match the given prefix (case-insensitive).
   */
  getSuggestions(prefix: string, limit = 50): T[] {
    prefix = prefix.toLowerCase();
    const node = this.getNode(prefix);
    if (!node) return [];

    const results: T[] = [];
    this.collectAllData(node, results, limit);
    return results.slice(0, limit);
  }
}
