"use client";

import React from "react";
import { SubscribeOptions } from "@/types/mqtt";
import { XCircle, MessageSquare } from "lucide-react";

interface TopicDisplayCardProps {
  subscription: SubscribeOptions;
  onUnsubscribe: (id: string, topic: string) => void;
  onSelectTopic: (topic: SubscribeOptions) => void;
  isSelected: boolean;
}

const TopicDisplayCard: React.FC<TopicDisplayCardProps> = ({
  subscription,
  onUnsubscribe,
  onSelectTopic,
  isSelected,
}) => {
  return (
    <div
      className={`relative p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "bg-blue-600 border-blue-500 shadow-xl"
            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
        }
        border`}
      onClick={() => onSelectTopic(subscription)}
      style={{ borderColor: isSelected ? subscription.color : "" }} // Highlight with topic color
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare
            size={20}
            className="mr-2"
            style={{ color: subscription.color }}
          />
          <h4
            className="font-bold text-lg"
            style={{ color: subscription.color }}
          >
            {subscription.alias || subscription.topic}
          </h4>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when unsubscribing
            onUnsubscribe(subscription.id, subscription.topic);
          }}
          className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-500 transition-colors"
          title={`Unsubscribe from ${subscription.topic}`}
        >
          <XCircle size={20} />
        </button>
      </div>
      <p className="text-gray-300 text-sm mt-1 truncate">
        Topic: {subscription.topic}
      </p>
      <p className="text-gray-400 text-xs">QoS: {subscription.qos}</p>
    </div>
  );
};

export default TopicDisplayCard;
