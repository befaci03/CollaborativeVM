# CollaborativeVM Server

A modern TypeScript implementation of a collaborative virtual machine server, allowing multiple users to interact with virtual machines simultaneously.

## Features

- Multiple virtualization backends support (QEMU, VirtualBox, VMware)
- Real-time screen sharing with H264 encoding
- Audio streaming support
- VNC protocol implementation
- WebSocket-based communication
- User management and permissions system
- Chat functionality
- Turn-based control system

## Prerequisites

- Node.js >=16.0.0
- Yarn package manager
- FFmpeg for video/audio encoding
- One or more of:
  - QEMU
  - VirtualBox
  - VMware Workstation/Player

## Installation

```bash
# Clone the repository
git clone https://github.com/befaci03/CollaborativeVM-Server.git
cd CollaborativeVM-Server

# Install dependencies
yarn install

# Build the project
yarn build
```

## Configuration

Copy `example.CONFIG.toml` to `config.toml` and adjust the settings:

```bash
cp example.CONFIG.toml config.toml
```

Key configuration options:
- Server port and bind address
- Authentication settings
- VM configurations
- Screen capture settings
- Network options

## Usage

Start the server:
```bash
yarn start
```

Development mode with auto-reload:
```bash
yarn build:watch
```

## Project Structure

```
src/
├── VM/
│   ├── Manager/       # VM backend implementations
│   ├── Screen.ts      # Screen capture
│   ├── Audio.ts       # Audio capture
│   └── h264Encoder.ts # Video encoding
├── Utils/            
│   ├── Config.ts      # Configuration manager
│   ├── Logger.ts      # Logging utility
│   └── ENCRYPTOR.ts   # Encryption utilities
└── Server.ts         # Main WebSocket server

colllibs/
└── Interfaces/       # TypeScript interfaces
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request (on **GitHub.com**)

## License

This project is licensed under the `Apache License 2.0` - see the LICENSE file for details.
