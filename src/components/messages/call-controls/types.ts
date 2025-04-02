
export interface CallControlsProps {
  onEndCall: () => void;
  onToggleChat: () => void;
  isVideoCall?: boolean;
  onToggleVideo?: (isVideoOff: boolean) => void;
  onToggleMute?: (isMuted: boolean) => void;
  onToggleScreenShare?: (isScreenSharing: boolean) => void;
}

export interface CallControlButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  active?: boolean;
  className?: string;
  activeClass?: string;
}
