# Nordic NR+ Device Support

This document describes the implementation of Nordic NR+ device support in the thingy.rocks dashboard.

## Overview

Nordic NR+ devices send data via LwM2M format using three specific object definitions:
- **14502**: Network Neighbor - describes neighboring devices with neighbor ID and radio signal strength
- **14503**: DECT NR+ Connection Profile - connection details including Long RD ID, Network ID, and operational mode
- **14220**: Button press - describes button press events

## Network Grouping

Devices are automatically grouped by their Network ID (from object 14503). All devices belonging to the same network are displayed in a single tile showing:

- Network information (Network ID, operational mode)
- List of devices in the network with their device IDs
- Aggregated neighbor information from all devices
- Button press counts for each device

## Device Types

The system now recognizes devices with `deviceType: 'nordic-nrplus'` and processes their LwM2M objects accordingly.

## UI Components

### NordicNrplusNetworkTile
- Displays grouped devices by network
- Shows network-level information
- Lists all devices in the network
- Aggregates neighbor data

### NordicNrplusTile  
- Displays individual nordic-nrplus devices
- Used for devices without network ID
- Shows device-specific data

## Data Structure

Nordic NR+ specific data is stored in the device state under `nordicNrplus`:

```typescript
nordicNrplus: {
  neighbors: Record<string, NordicNrplusNeighbor>
  connectionProfile?: NordicNrplusConnectionProfile  
  buttonPresses: Record<string, NordicNrplusButtonPress>
}
```

## Implementation Details

1. **Device Type Detection**: Devices are marked as `NORDIC_NRPLUS` type when LwM2M objects 14502, 14503, or 14220 are detected
2. **LwM2M Processing**: Extended the LwM2M context to process the new object types and store data appropriately
3. **Network Grouping**: DeviceList groups devices by Network ID and renders them using NordicNrplusNetworkTile
4. **Fallback Handling**: Devices without Network ID are shown individually using NordicNrplusTile