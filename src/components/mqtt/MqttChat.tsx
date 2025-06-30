"use client";

import React, { useEffect, useRef, useState } from "react";
import { MqttMessage, PayloadFormat, PublishOptions } from "@/types/mqtt";
import { formatBytes } from "@/utils/formatBytes";
import JsonViewer from "./MessageViewers/JsonViewer";
import HexViewer from "./MessageViewers/HexViewer";
import Base64Viewer from "./MessageViewers/Base64Viewer";
import PlainTextViewer from "./MessageViewers/PlainTextViewer";
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ArrowUpFromDot,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MqttChatBoxProps {
  messages: MqttMessage[];
  onPublish: (options: PublishOptions) => void;
  isConnected: boolean;
  protocolVersion: 4 | 5;
}

const MqttChatBox: React.FC<MqttChatBoxProps> = ({
  messages,
  onPublish,
  isConnected,
  protocolVersion,
}) => {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null
  );
  const [viewFormat, setViewFormat] = useState<
    "plaintext" | "json" | "hex" | "base64" | string
  >("plaintext");
  const [payload, setPayload] = useState('{"message": "Hello MQTT!"}');
  const [publishTopic, setPublishTopic] = useState("");
  const [format, setFormat] = useState<PayloadFormat>("json");
  const [qos, setQos] = useState<0 | 1 | 2>(0);
  const [retain, setRetain] = useState(false);
  const [enableProperties, setEnableProperties] = useState(false);
  const [messageExpiryInterval, setMessageExpiryInterval] = useState<
    number | undefined
  >(undefined);
  const [contentType, setContentType] = useState("");
  const [responseTopic, setResponseTopic] = useState("");
  const [correlationData, setCorrelationData] = useState("");
  const [payloadFormatIndicator, setPayloadFormatIndicator] = useState<
    0 | 1 | undefined
  >(undefined);
  const [userProperties, setUserProperties] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleExpand = (id: string, message: MqttMessage) => {
    setExpandedMessageId(expandedMessageId === id ? null : id);
    if (message.parsedPayload) setViewFormat("json");
    else setViewFormat("plaintext");
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Not connected to MQTT broker.");
      return;
    }
    if (!publishTopic.trim()) {
      toast.error("Publish topic cannot be empty.");
      return;
    }
    if (!payload.trim()) {
      toast.error("Payload cannot be empty.");
      return;
    }

    // Validate payload format
    if (format === "json") {
      try {
        JSON.parse(payload);
      } catch {
        toast.error("Payload must be valid JSON.");
        return;
      }
    }
    if (format === "hex") {
      const hexRegex = /^[0-9a-fA-F]*$/;
      if (!hexRegex.test(payload.replace(/\s+/g, ""))) {
        toast.error("Payload must be valid HEX (0-9, A-F).");
        return;
      }
    }
    if (format === "base64") {
      const base64Regex =
        /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
      if (!base64Regex.test(payload.replace(/\s+/g, ""))) {
        toast.error("Payload must be valid Base64.");
        return;
      }
    }

    let parsedUserProps: Record<string, string> | undefined;
    if (enableProperties && userProperties) {
      try {
        parsedUserProps = JSON.parse(userProperties);
      } catch {
        toast.error("Invalid JSON for User Properties.");
        return;
      }
    }

    const options: PublishOptions = {
      topic: publishTopic,
      payload,
      format,
      qos,
      retain,
      properties:
        protocolVersion === 5 && enableProperties
          ? {
              messageExpiryInterval,
              contentType: contentType || undefined,
              responseTopic: responseTopic || undefined,
              correlationData: correlationData || undefined,
              payloadFormatIndicator,
              userProperties: parsedUserProps,
            }
          : undefined,
    };

    onPublish(options);
    setPayload('{"message": "Hello MQTT!"}');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-2 sm:space-y-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-xs sm:text-sm">
            No messages to display. Select topics to view their messages.
          </p>
        ) : (
          messages.map((msg) => {
            const isExpanded = expandedMessageId === msg.id;
            const isPublished = msg.isPublished;

            return (
              <div
                key={msg.id}
                className={`max-w-[80%] sm:max-w-[70%] p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl transition-all ${
                  isPublished
                    ? "ml-auto bg-gradient-to-r from-purple-600 to-purple-800 text-white"
                    : "mr-auto bg-gray-800 text-gray-200"
                } ${
                  isExpanded
                    ? "ring-2 ring-blue-500 scale-[1.02]"
                    : "hover:ring hover:ring-gray-500 hover:scale-[1.01]"
                }`}
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(msg.id, msg)}
                >
                  <div className="flex items-center flex-1 min-w-0 pr-1 sm:pr-3">
                    {isPublished ? (
                      <ArrowUpFromDot
                        size={14}
                        className="mr-1 sm:mr-2 text-white w-4 h-4 sm:w-5 sm:h-5"
                      />
                    ) : (
                      <MessageSquare
                        size={14}
                        className="mr-1 sm:mr-2 text-green-400 w-4 h-4 sm:w-5 sm:h-5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs opacity-70 block">
                        {msg.timestamp}
                      </span>
                      <h4 className="font-semibold truncate text-xs sm:text-sm">
                        {msg.topic}
                      </h4>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown
                      size={16}
                      className="opacity-70 w-4 h-4 sm:w-5 sm:h-5"
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="opacity-70 w-4 h-4 sm:w-5 sm:h-5"
                    />
                  )}
                </div>

                <p className="mt-1 sm:mt-2 text-xs sm:text-sm break-words">
                  {msg.message.length > 100
                    ? `${msg.message.slice(0, 100)}...`
                    : msg.message}
                </p>

                <div className="mt-1 sm:mt-2 text-xs opacity-70">
                  QoS: {msg.qos} | Size: {formatBytes(msg.size)}
                </div>

                {isExpanded && (
                  <div className="mt-2 sm:mt-4 border-t border-gray-700 pt-2 sm:pt-4 space-y-2 sm:space-y-3">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {["plaintext", "json", "hex", "base64"].map((fmt) => (
                        <button
                          key={fmt}
                          className={`px-1 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm transition ${
                            viewFormat === fmt
                              ? "bg-blue-500 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                          onClick={() => setViewFormat(fmt)}
                          disabled={fmt === "json" && !msg.parsedPayload}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className="h-32 sm:h-48 overflow-y-auto bg-black rounded-lg p-1 sm:p-3 border border-gray-700">
                      {viewFormat === "json" && msg.parsedPayload ? (
                        <JsonViewer data={msg.parsedPayload} />
                      ) : viewFormat === "hex" ? (
                        <HexViewer data={msg.message} />
                      ) : viewFormat === "base64" ? (
                        <Base64Viewer data={msg.message} />
                      ) : (
                        <PlainTextViewer data={msg.message} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Publish Form */}
      <form
        onSubmit={handlePublish}
        className="p-2 sm:p-4 border-t border Scrabble up to 7 letters from: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
-gray-800 bg-gray-950 space-y-2 sm:space-y-3"
      >
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            className="bg-gray-800 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-xl border border-gray-700 text-xs sm:text-sm focus:ring focus:ring-purple-500"
            placeholder="Enter topic to publish"
            value={publishTopic}
            onChange={(e) => setPublishTopic(e.target.value)}
            disabled={!isConnected}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              className="flex-1 bg-gray-800 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-xl border border-gray-700 text-xs sm:text-sm focus:ring focus:ring-purple-500"
              placeholder="Enter message payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              disabled={!isConnected}
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-xl shadow-xl flex items-center justify-center w-full sm:w-auto text-xs sm:text-sm"
              disabled={!isConnected || !publishTopic.trim() || !payload.trim()}
              aria-label="Publish message"
            >
              <Send
                size={12}
                className="mr-0.5 sm:mr-1 w-3 h-3 sm:w-4 sm:h-4"
              />
              Send
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs sm:text-sm">
          <select
            className="bg-gray-800 text-white py-1 px-2 sm:px-3 rounded-lg border border-gray-700 min-w-[100px] sm:min-w-[110px]"
            value={format}
            onChange={(e) => setFormat(e.target.value as PayloadFormat)}
            disabled={!isConnected}
          >
            <option value="plaintext">Plaintext</option>
            <option value="json">JSON</option>
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>

          <select
            className="bg-gray-800 text-white py-1 px-2 sm:px-3 rounded-lg border border-gray-700 w-[90px] sm:w-[100px]"
            value={qos}
            onChange={(e) => setQos(Number(e.target.value) as 0 | 1 | 2)}
            disabled={!isConnected}
          >
            <option value={0}>QoS 0</option>
            <option value={1}>QoS 1</option>
            <option value={2}>QoS 2</option>
          </select>

          <label className="inline-flex items-center text-gray-300">
            <input
              type="checkbox"
              className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 border-gray-600"
              checked={retain}
              onChange={(e) => setRetain(e.target.checked)}
              disabled={!isConnected}
            />
            <span className="ml-0.5 sm:ml-1">Retain</span>
          </label>
        </div>
      </form>
    </div>
  );
};

export default MqttChatBox;
