declare module 'react-qr-scanner' {
  import * as React from 'react';

  export interface QrReaderProps {
    onResult?: (result: any) => void;
    onError?: (error: any) => void;
    constraints?: MediaTrackConstraints;
    style?: React.CSSProperties;
    facingMode?: string;
    delay?: number;
  }

  const QrReader: React.FC<QrReaderProps>;
  export default QrReader;
}
