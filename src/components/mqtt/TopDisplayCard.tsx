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
      className="p-2 rounded-xl bg-gray-700 border-2 border-gray-600 hover:bg-gray-600 transition-all"
      style={{ borderColor: subscription.color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Checkbox tròn có tick */}
          <label className="relative flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onToggleCheck}
              className="peer hidden"
              aria-label={`Toggle display for ${
                subscription.alias || subscription.topic
              }`}
            />
            <div
              className="
            w-5 h-5 rounded-full border-2 border-gray-500 
            bg-gray-800 
            flex items-center justify-center 
            transition-all duration-200 
            peer-checked:bg-gradient-to-tr peer-checked:from-green-500 peer-checked:to-teal-500 
            peer-checked:border-green-500
            peer-hover:scale-105
          "
            >
              <svg
                className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </label>

          <div>
            <p className="text-sm font-semibold text-white" style={{ color: subscription.color }}>
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
          aria-label={`Unsubscribe from ${
            subscription.alias || subscription.topic
          }`}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};

export default TopicDisplayCard;
