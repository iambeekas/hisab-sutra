import { Fragment, type ReactNode } from 'react';

/**
 * Fill {placeholders} in a (translated) sentence with React nodes, so a sentence that
 * contains a link, a name or a highlighted phrase can be translated as one unit and
 * each language can put the pieces in its own word order.
 */
export function renderTemplate(text: string, vars: Record<string, ReactNode>): ReactNode[] {
  return text.split(/(\{\w+\})/).map((part, i) => {
    const match = part.match(/^\{(\w+)\}$/);
    if (match && match[1] in vars) return <Fragment key={i}>{vars[match[1]]}</Fragment>;
    return part;
  });
}
