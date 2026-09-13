import { create } from "zustand";
import { useNotificationStore } from "./desktopStore";

interface BatteryStore {
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
  powerMode: "saver" | "balanced" | "performance";
  isSupported: boolean;
  setPowerMode: (mode: "saver" | "balanced" | "performance") => void;
  toggleCharging: () => void;
  setLevel: (level: number) => void;
  initBattery: () => void;
}

export const useBatteryStore = create<BatteryStore>((set, get) => ({
  level: 88,
  charging: true,
  chargingTime: null,
  dischargingTime: null,
  powerMode: "balanced",
  isSupported: false,

  setPowerMode: (mode) => {
    set({ powerMode: mode });
    const label =
      mode === "saver"
        ? "Power Saver Enabled"
        : mode === "performance"
          ? "High Performance Enabled"
          : "Balanced Power Mode";
    useNotificationStore.getState().add(label, "battery", 2500);
  },

  toggleCharging: () => {
    const next = !get().charging;
    set({ charging: next });
    useNotificationStore
      .getState()
      .add(
        next ? "Power Connected (Charging)" : "Running on Battery Power",
        next ? "battery-charging" : "battery",
        2500,
      );
  },

  setLevel: (level) => {
    const clamped = Math.max(1, Math.min(100, level));
    set({ level: clamped });
  },

  initBattery: async () => {
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        set({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime:
            battery.chargingTime === Infinity ? null : battery.chargingTime,
          dischargingTime:
            battery.dischargingTime === Infinity
              ? null
              : battery.dischargingTime,
          isSupported: true,
        });

        battery.addEventListener("levelchange", () => {
          const newLevel = Math.round(battery.level * 100);
          set({ level: newLevel });
          if (newLevel <= 20 && !battery.charging) {
            useNotificationStore
              .getState()
              .add(`Low Battery Warning (${newLevel}%)`, "battery-low", 4000);
          }
        });

        battery.addEventListener("chargingchange", () => {
          set({ charging: battery.charging });
          useNotificationStore
            .getState()
            .add(
              battery.charging
                ? "Power Connected (Charging)"
                : "Unplugged — On Battery",
              battery.charging ? "battery-charging" : "battery",
              3000,
            );
        });

        battery.addEventListener("chargingtimechange", () => {
          set({
            chargingTime:
              battery.chargingTime === Infinity ? null : battery.chargingTime,
          });
        });

        battery.addEventListener("dischargingtimechange", () => {
          set({
            dischargingTime:
              battery.dischargingTime === Infinity
                ? null
                : battery.dischargingTime,
          });
        });
      } catch {
        set({ isSupported: false });
      }
    } else {
      set({ isSupported: false });
    }
  },
}));
