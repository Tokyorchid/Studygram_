
export interface CallControlButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label?: string;
  activeClass?: string;
  className?: string;
}

export interface CallControlsProps {
  onEndCall: () => void;
  onToggleChat: () => void;
  isVideoCall?: boolean;
  onToggleVideo?: (videoOff: boolean) => void;
  onToggleMute?: (muted: boolean) => void;
}
