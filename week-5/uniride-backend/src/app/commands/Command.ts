// COMMAND (Week 5). An action encapsulated as an object that can be executed, logged, and undone.
export interface Command {
  readonly label: string;
  execute(): Promise<void> | void;
  undo(): Promise<void> | void;
}
export class CommandInvoker {
  private readonly history: Command[] = [];
  async run(command: Command): Promise<void> { await command.execute(); this.history.push(command); }
  async undoLast(): Promise<void> { const command = this.history.pop(); if (command) await command.undo(); }
  size(): number { return this.history.length; }
}
