import { useState, useEffect } from 'react';

export interface DeviceBatteryState {
  level: number; // 0 to 100
  charging: boolean;
  supported: boolean;
}

export function useDeviceBattery(): DeviceBatteryState {
  const [batteryState, setBatteryState] = useState<DeviceBatteryState>({
    level: 95,
    charging: false,
    supported: false,
  });

  useEffect(() => {
    let mounted = true;

    async function initBattery() {
      try {
        if ('getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          if (!mounted) return;

          const update = () => {
            setBatteryState({
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              supported: true,
            });
          };

          update();
          battery.addEventListener('levelchange', update);
          battery.addEventListener('chargingchange', update);

          return () => {
            battery.removeEventListener('levelchange', update);
            battery.removeEventListener('chargingchange', update);
          };
        }
      } catch (e) {
        // Fallback for browsers without Battery API
      }
    }

    initBattery();

    return () => {
      mounted = false;
    };
  }, []);

  return batteryState;
}
