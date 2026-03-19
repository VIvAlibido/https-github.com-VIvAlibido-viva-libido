// DAB+ Mux Server Types based on ODR-DabMux configuration

export interface MuxGeneral {
  dabmode: 1 | 2 | 3 | 4;
  nbframes: number;
  syslog: boolean;
  tist: boolean;
  managementport: number;
}

export interface RemoteControl {
  telnetEnabled: boolean;
  telnetPort: number;
  zmqEnabled: boolean;
  zmqEndpoint: string;
}

export interface Ensemble {
  id: string; // hex e.g. "0x4fff"
  ecc: string; // hex e.g. "0xe1"
  label: string;
  shortlabel: string;
  lto: number; // local time offset
}

export interface Service {
  id: string; // unique key
  serviceId: string; // hex e.g. "0x4daa"
  label: string;
  shortlabel: string;
  pty: number; // programme type
  language: number;
}

export interface Subchannel {
  id: string; // unique key
  type: "audio" | "data" | "packet";
  inputType: "file" | "zmq" | "edi" | "sti";
  inputUri: string;
  bitrate: number;
  protection: number;
  protectionProfile: "EEP_A" | "EEP_B" | "UEP";
  zmqBufferSize?: number;
  zmqPrebuffering?: number;
}

export interface Component {
  id: string;
  serviceId: string; // references a Service
  subchannelId: string; // references a Subchannel
  label: string;
  figType: string; // e.g. "0x2"
  userApplication?: string;
}

export interface Output {
  id: string;
  type: "edi-tcp" | "edi-udp" | "zmq" | "eti-tcp" | "simul" | "throttle" | "file";
  enabled: boolean;
  destination?: string;
  port?: number;
  sourcePort?: number;
  // EDI specific
  fec?: number;
  interleave?: number;
}

export interface MuxConfig {
  general: MuxGeneral;
  remotecontrol: RemoteControl;
  ensemble: Ensemble;
  services: Service[];
  subchannels: Subchannel[];
  components: Component[];
  outputs: Output[];
}

export interface MuxStatus {
  running: boolean;
  pid?: number;
  uptime?: number;
  timestamp?: string;
  frameCount?: number;
}

export interface SubchannelStats {
  id: string;
  label: string;
  bitrate: number;
  bufferState: number; // percentage
  overruns: number;
  underruns: number;
  inputState: "ok" | "buffering" | "error" | "disconnected";
}

export interface MuxStatistics {
  timestamp: string;
  ensembleLabel: string;
  subchannels: SubchannelStats[];
  cuUsed: number;
  cuTotal: number; // 864 CU for mode 1
}

export const DEFAULT_CONFIG: MuxConfig = {
  general: {
    dabmode: 1,
    nbframes: 0,
    syslog: false,
    tist: true,
    managementport: 12720,
  },
  remotecontrol: {
    telnetEnabled: true,
    telnetPort: 12721,
    zmqEnabled: true,
    zmqEndpoint: "tcp://lo:12722",
  },
  ensemble: {
    id: "0x4fff",
    ecc: "0xe1",
    label: "Viva Libido DAB",
    shortlabel: "VivaDAB",
    lto: 1,
  },
  services: [],
  subchannels: [],
  components: [],
  outputs: [
    {
      id: "throttle",
      type: "throttle",
      enabled: true,
    },
    {
      id: "edi-tcp",
      type: "edi-tcp",
      enabled: true,
      destination: "0.0.0.0",
      port: 13000,
    },
  ],
};
