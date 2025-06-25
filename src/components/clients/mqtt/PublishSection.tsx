// src/components/clients/mqtt/PublishSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  PayloadFormat,
  PublishOptions,
  SubscribeOptions,
} from "@/types/mqtt/mqtt";
import { Send, SlidersHorizontal, MessageCircleMore } from "lucide-react";
import { toast } from "react-toastify";

interface PublishSectionProps {
  onPublish: (options: PublishOptions) => void;
  isConnected: boolean;
  protocolVersion: 4 | 5;
  selectedTopic: SubscribeOptions | null; // NEW: Pass the selected topic
}

const PublishSection: React.FC<PublishSectionProps> = ({
  onPublish,
  isConnected,
  protocolVersion,
  selectedTopic,
}) => {
  const [topic, setTopic] = useState(selectedTopic?.topic || "com21/data");
  const [payload, setPayload] = useState('{"message": "Hello MQTT!"}');
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

  // Update topic when selectedTopic changes
  useEffect(() => {
    if (selectedTopic) {
      setTopic(selectedTopic.topic);
      setQos(selectedTopic.qos); // Inherit QoS from selected subscription as a default
    } else {
      setTopic(""); // Clear topic if no topic is selected
    }
  }, [selectedTopic]);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error(
        "Topic cannot be empty. Please select a topic from subscriptions or manually enter one."
      );
      return;
    }
    if (!payload.trim()) {
      toast.error("Payload cannot be empty.");
      return;
    }

    let parsedUserProperties: { [key: string]: string } | undefined;
    if (enableProperties && userProperties) {
      try {
        parsedUserProperties = JSON.parse(userProperties);
      } catch (error) {
        toast.error("Invalid User Properties JSON for publish. Please fix it.");
        return;
      }
    }

    const options: PublishOptions = {
      topic,
      payload,
      format,
      qos,
      retain,
      properties:
        protocolVersion === 5 && enableProperties
          ? {
              messageExpiryInterval: messageExpiryInterval ?? undefined,
              contentType: contentType || undefined,
              responseTopic: responseTopic || undefined,
              correlationData: correlationData || undefined,
              payloadFormatIndicator: payloadFormatIndicator ?? undefined,
              userProperties: parsedUserProperties,
            }
          : undefined,
    };
    onPublish(options);
  };

  // Only render if a topic is selected
  if (!selectedTopic) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-xl flex flex-col h-full border border-gray-700 justify-center items-center">
        <MessageCircleMore size={48} className="text-gray-500 mb-4" />
        <p className="text-gray-400 text-lg text-center">
          Select a subscribed topic to publish messages.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gray-900 rounded-2xl shadow-2xl flex flex-col h-full border border-gray-800">
      <h2 className="text-lg font-bold text-purple-400 mb-4 border-b border-gray-800 pb-2 flex items-center">
        <Send size={18} className="mr-2 text-purple-400" />
        Publish to
        <span
          style={{ color: selectedTopic.color }}
          className="ml-2 truncate text-white font-medium"
        >
          {selectedTopic.alias || selectedTopic.topic}
        </span>
      </h2>

      <form onSubmit={handlePublish} className="flex flex-col gap-3 flex-grow">
        {/* Topic */}
        <div>
          <input
            type="text"
            className="w-full bg-gray-800 text-white placeholder-gray-500 py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 text-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={!isConnected}
            placeholder="Topic"
          />
        </div>

        {/* Payload */}
        <div>
          <textarea
            className="w-full h-24 bg-gray-800 text-white placeholder-gray-500 py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 text-sm"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            required
            disabled={!isConnected}
            placeholder="Payload"
          />
        </div>

        {/* Các thuộc tính gom hết về 1 hàng */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format */}
          <select
            className="bg-gray-800 text-white py-1 px-2 rounded-lg border border-gray-700 text-sm focus:ring-2 focus:ring-purple-500 min-w-[110px]"
            value={format}
            onChange={(e) => setFormat(e.target.value as PayloadFormat)}
            disabled={!isConnected}
          >
            <option value="plaintext">Plaintext</option>
            <option value="json">JSON</option>
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>

          {/* QoS */}
          <select
            className="bg-gray-800 text-white py-1 px-2 rounded-lg border border-gray-700 text-sm focus:ring-2 focus:ring-purple-500 w-[70px]"
            value={qos}
            onChange={(e) => setQos(Number(e.target.value) as 0 | 1 | 2)}
            disabled={!isConnected}
          >
            <option value={0}>QoS 0</option>
            <option value={1}>QoS 1</option>
            <option value={2}>QoS 2</option>
          </select>

          {/* Retain */}
          <label className="inline-flex items-center text-gray-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 text-purple-600 rounded border-gray-600 focus:ring-purple-500"
              checked={retain}
              onChange={(e) => setRetain(e.target.checked)}
              disabled={!isConnected}
            />
            <span className="ml-1">Retain</span>
          </label>
        </div>

        {/* Nút Publish */}
        <button
          type="submit"
          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-md flex items-center justify-center text-sm"
          disabled={!isConnected}
        >
          <MessageCircleMore size={16} className="mr-2" /> Publish
        </button>
      </form>
    </div>
  );
};

export default PublishSection;
