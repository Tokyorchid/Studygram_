
export interface CallControlsProps {
  onEndCall: () => void;
  onToggleChat: () => void;
  isVideoCall?: boolean;
  onToggleVideo?: (isVideoOff: boolean) => void;
  onToggleMute?: (isMuted: boolean) => void;
  onToggleScreenShare?: (isScreenSharing: boolean) => void;
}
