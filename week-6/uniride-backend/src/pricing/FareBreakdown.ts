import { Money } from "../shared/Money";
// COMPOSITE (Week 4). A leaf line-item and a group of components share ONE interface, so a
// caller totals any node the same way — amount() just recurses. (All components are charges;
// non-negative, honouring Money's invariant. Discounts are applied as a separate step.)
export interface FareComponent { readonly label: string; amount(): Money; }

export class FareLineItem implements FareComponent {
  constructor(public readonly label: string, private readonly value: Money) {}
  amount(): Money { return this.value; }
}

export class FareGroup implements FareComponent {
  private readonly children: FareComponent[] = [];
  constructor(public readonly label: string) {}
  add(component: FareComponent): this { this.children.push(component); return this; }
  items(): readonly FareComponent[] { return this.children; }
  amount(): Money { return this.children.reduce((sum, c) => sum.add(c.amount()), Money.of(0)); }
  print(indent = 0): string {
    const pad = "  ".repeat(indent);
    const lines = [`${pad}${this.label}: ${this.amount().toString()}`];
    for (const child of this.children) {
      lines.push(child instanceof FareGroup ? child.print(indent + 1) : `${pad}  ${child.label}: ${child.amount().toString()}`);
    }
    return lines.join("\n");
  }
}
