import { describe, it, expect } from 'vitest';
import { NotificationType, NOTIFICATION_TYPE_CONFIG } from './message-template.model';

describe('message-template.model config', () => {
  it('should define metadata for all NotificationType values', () => {
    const types = Object.values(NotificationType);
    for (const t of types) {
      const config = NOTIFICATION_TYPE_CONFIG[t];
      expect(config).toBeDefined();
      expect(config.friendlyTitle).toBeTruthy();
      expect(config.triggerDescription).toBeTruthy();
      expect(config.icon).toBeTruthy();
      expect(config.availableVariables.length).toBeGreaterThan(0);
    }
  });

  it('should include correct variables for ALMOST_THERE_NOTIFICATION', () => {
    const config = NOTIFICATION_TYPE_CONFIG[NotificationType.ALMOST_THERE_NOTIFICATION];
    const tokens = config.availableVariables.map(v => v.token);
    expect(tokens).toContain('{nombre}');
    expect(tokens).toContain('{empresa}');
    expect(tokens).toContain('{puntos_faltantes}');
    expect(tokens).toContain('{local}');
  });
});
