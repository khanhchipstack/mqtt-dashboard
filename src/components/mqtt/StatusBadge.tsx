import React from 'react';
import { Circle, MinusCircle, Loader, WifiOff } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Connected' | 'Connecting' | 'Disconnected' | 'Error';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let icon;
  let colorClass;
  let text;

  switch (status) {
    case 'Connected':
      icon = <Circle size={16} fill="currentColor" />;
      colorClass = 'text-green-500';
      text = 'Connected';
      break;
    case 'Connecting':
      icon = <Loader size={16} className="animate-spin" />;
      colorClass = 'text-yellow-500';
      text = 'Connecting...';
      break;
    case 'Disconnected':
      icon = <MinusCircle size={16} />;
      colorClass = 'text-gray-500';
      text = 'Disconnected';
      break;
    case 'Error':
      icon = <WifiOff size={16} />;
      colorClass = 'text-red-500';
      text = 'Error';
      break;
    default:
      icon = <MinusCircle size={16} />;
      colorClass = 'text-gray-500';
      text = 'Unknown';
  }

  return (
    <span className={`inline-flex items-center text-sm font-semibold ${colorClass}`}>
      {icon}
      <span className="ml-2">{text}</span>
    </span>
  );
};

export default StatusBadge;