"use client";

import React from "react";
import { SubscribeOptions } from "@/types/mqtt";
import { Button } from "@/components/ui/button";
import { X, CheckCircle } from "lucide-react";

interface TopicDisplayCardProps {
  subscription: SubscribeOptions;
  onUnsubscribe: (id: string, topic: string) => void;
  isChecked: boolean;
  onToggleCheck: () => void;
}

const TopicDisplayCard: React.FC<TopicDisplayCardProps> = ({
  subscription,
  onUnsubscribe,
  isChecked,
  onToggleCheck,
}) => {
  return (
    <div
      className="p-2 rounded-lg bg-gray-700 border-2 border-gray-600 hover:bg-gray-600 transition-all"
      style={{ borderColor: subscription.color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggleCheck}
            className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
            aria-label={`Toggle display for ${subscription.alias || subscription.topic}`}
          />
          <div>
            <p className="text-sm font-semibold text-white">
              {subscription.alias || subscription.topic}
            </p>
            <p className="text-xs text-gray-400">QoS: {subscription.qos}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUnsubscribe(subscription.id, subscription.topic)}
          className="text-red-400 hover:text-red-500 hover:bg-gray-800"
          aria-label={`Unsubscribe from ${subscription.alias || subscription.topic}`}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};

export default TopicDisplayCard;