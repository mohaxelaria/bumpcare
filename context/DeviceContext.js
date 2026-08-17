import React, { createContext, useContext, useState } from 'react';

const DeviceContext = createContext(null);

// Sensor health isn't reported by real hardware yet — static "ready" state
// for all three. This is where a real ESP32 fault (e.g. "Contact Sensor:
// Not responding") would flow in once that reporting exists.
const STATIC_SENSORS = {
  imu: 'ready',
  contact: 'ready',
  batteryMonitor: 'ready',
};

export function DeviceProvider({ children }) {
  // pairedDevice: null (never paired) or
  // { id, name, connected, battery, signal, firmware, lastConnectedAt }
  const [pairedDevice, setPairedDevice] = useState(null);

  const pairDevice = (device) => {
    setPairedDevice({
      id: device.id,
      name: device.name,
      connected: true,
      battery: device.battery,
      signal: device.signal,
      firmware: 'v1.0.0',
      lastConnectedAt: new Date().toISOString(),
    });
  };

  const disconnectDevice = () => {
    setPairedDevice((prev) => (prev ? { ...prev, connected: false } : prev));
  };

  const reconnectDevice = () => {
    // Mock reconnect-by-stored-ID — real BLE reconnect comes later.
    setPairedDevice((prev) =>
      prev
        ? { ...prev, connected: true, lastConnectedAt: new Date().toISOString() }
        : prev
    );
  };

  const forgetDevice = () => {
    setPairedDevice(null);
  };

  return (
    <DeviceContext.Provider
      value={{
        pairedDevice,
        sensors: STATIC_SENSORS,
        pairDevice,
        disconnectDevice,
        reconnectDevice,
        forgetDevice,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return ctx;
}
