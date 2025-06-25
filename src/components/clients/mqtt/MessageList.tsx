// src/components/clients/mqtt/MessageList.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { MqttMessage } from "@/types/mqtt/mqtt";
import { formatBytes } from "@/utils/mqtt/formatBytes";
import JsonViewer from "./MessageViewers/JsonViewer";
import HexViewer from "./MessageViewers/HexViewer";
import Base64Viewer from "./MessageViewers/Base64Viewer";
import PlainTextViewer from "./MessageViewers/PlainTextViewer";
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ArrowUpFromDot,
} from "lucide-react";

interface MessageListProps {
  messages: MqttMessage[];
  filterTopic?: string; // NEW: Topic to filter messages by
}

const MessageList: React.FC<MessageListProps> = ({ messages, filterTopic }) => {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const [viewFormat, setViewFormat] = useState<
    "plaintext" | "json" | "hex" | "base64" | string
  >("plaintext");

  const toggleExpand = (id: string, message: MqttMessage) => {
    setExpandedMessageId(expandedMessageId === id ? null : id);
    // When expanding, try to default to JSON if it was parsed
    if (message.parsedPayload) {
      setViewFormat("json");
    } else {
      setViewFormat("plaintext");
    }
  };

  const filteredMessages = filterTopic
    ? messages.filter((msg) => msg.topic === filterTopic)
    : messages;

  return (
    <div className="flex-1 bg-gray-900 rounded-2xl p-4 shadow-inner border border-gray-800 flex flex-col">
      {filteredMessages.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {filterTopic
            ? `No messages for topic "${filterTopic}" yet.`
            : "No messages received yet."}
        </p>
      ) : (
        <div className="flex flex-col space-y-4 overflow-y-auto max-h-[450px] pr-2">
          {filteredMessages.map((message) => {
            const isExpanded = expandedMessageId === message.id;
            const isPublished = message.isPublished;

            return (
              <div
                key={message.id}
                className={`max-w-[70%] p-4 rounded-xl shadow-md transition-all duration-200 ${
                  isPublished
                    ? "ml-auto bg-purple-600 text-white"
                    : "mr-auto bg-gray-800 text-gray-200"
                } ${
                  isExpanded
                    ? "ring-2 ring-blue-500"
                    : "hover:ring-1 hover:ring-gray-500"
                }`}
              >
                {/* Header */}
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(message.id, message)}
                >
                  <div className="flex items-center flex-1 min-w-0 pr-3">
                    {isPublished ? (
                      <ArrowUpFromDot size={18} className="mr-2 text-white" />
                    ) : (
                      <MessageSquare
                        size={18}
                        className="mr-2 text-green-400"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <span className="text-xs block opacity-70">
                        {message.timestamp}
                      </span>
                      <h4 className="font-semibold truncate">
                        {message.topic}
                      </h4>
                    </div>
                  </div>

                  <div>
                    {isExpanded ? (
                      <ChevronDown size={20} className="opacity-70" />
                    ) : (
                      <ChevronRight size={20} className="opacity-70" />
                    )}
                  </div>
                </div>

                {/* Preview Payload */}
                <p className="mt-2 text-sm break-words">
                  {message.message.length > 100
                    ? `${message.message.substring(0, 100)}...`
                    : message.message}
                </p>

                {/* Metadata */}
                <div className="mt-2 text-xs opacity-70">
                  QoS: {message.qos} | Size: {formatBytes(message.size)}
                </div>

                {/* Expanded Viewer */}
                {isExpanded && (
                  <div className="mt-4 border-t border-gray-700 pt-4 space-y-3">
                    <div className="flex space-x-2 flex-wrap">
                      {["plaintext", "json", "hex", "base64"].map((fmt) => (
                        <button
                          key={fmt}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            viewFormat === fmt
                              ? "bg-blue-500 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                          onClick={() => setViewFormat(fmt)}
                          disabled={fmt === "json" && !message.parsedPayload}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="h-48 overflow-y-auto bg-black rounded-lg p-3 border border-gray-700">
                      {viewFormat === "json" && message.parsedPayload ? (
                        <JsonViewer data={message.parsedPayload} />
                      ) : viewFormat === "hex" ? (
                        <HexViewer data={message.message} />
                      ) : viewFormat === "base64" ? (
                        <Base64Viewer data={message.message} />
                      ) : (
                        <PlainTextViewer data={message.message} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
