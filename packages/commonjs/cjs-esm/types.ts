import { Node } from 'acorn';

export type AstNode = Node & Record<string, any>;
