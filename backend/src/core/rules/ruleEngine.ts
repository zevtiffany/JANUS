import { logger } from '../utils/logger';

export interface Rule {
  id: string;
  name: string;
  module: string;
  description: string;
  condition: (context: any) => boolean;
  action: (context: any) => Promise<void> | void;
  priority: number;
}

class RuleEngine {
  private rules: Rule[] = [];

  register(rule: Rule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
    logger.debug(`Rule registered: ${rule.name} (priority: ${rule.priority})`);
  }

  async evaluate(module: string, context: any): Promise<string[]> {
    const moduleRules = this.rules.filter((r) => r.module === module);
    const triggeredRules: string[] = [];

    for (const rule of moduleRules) {
      try {
        if (rule.condition(context)) {
          logger.info(`Rule triggered: ${rule.name}`);
          await rule.action(context);
          triggeredRules.push(rule.id);
        }
      } catch (error) {
        logger.error(`Error evaluating rule ${rule.name}:`, (error as Error).message);
      }
    }

    return triggeredRules;
  }

  async evaluateAll(context: any): Promise<string[]> {
    const triggeredRules: string[] = [];

    for (const rule of this.rules) {
      try {
        if (rule.condition(context)) {
          logger.info(`Rule triggered: ${rule.name}`);
          await rule.action(context);
          triggeredRules.push(rule.id);
        }
      } catch (error) {
        logger.error(`Error evaluating rule ${rule.name}:`, (error as Error).message);
      }
    }

    return triggeredRules;
  }

  getRules(module?: string): Rule[] {
    if (module) {
      return this.rules.filter((r) => r.module === module);
    }
    return this.rules;
  }
}

export const ruleEngine = new RuleEngine();
