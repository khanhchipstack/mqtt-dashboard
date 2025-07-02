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
  Settings,
  Trash,
  Plus,
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

interface UserProperty {
  key: string;
  value: string;
}

const MqttChatBox: React.FC<MqttChatBoxProps> = ({
  messages,
  onPublish,
  isConnected,
  protocolVersion,
}) => {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [topicAlias, setTopicAlias] = useState<number | undefined>(undefined);
  const [viewFormat, setViewFormat] = useState<
    "plaintext" | "json" | "hex" | "base64" | string
  >("plaintext");
  const [payload, setPayload] = useState('{"message": "Hello MQTT!"}');
  const [publishTopic, setPublishTopic] = useState("");
  const [format, setFormat] = useState<PayloadFormat>("json");
  const [qos, setQos] = useState<0 | 1 | 2>(0);
  const [retain, setRetain] = useState(false);
  const [enableProperties, setEnableProperties] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [messageExpiryInterval, setMessageExpiryInterval] = useState<
    number | undefined
  >(undefined);
  const [contentType, setContentType] = useState("");
  const [responseTopic, setResponseTopic] = useState("");
  const [correlationData, setCorrelationData] = useState("");
  const [payloadFormatIndicator, setPayloadFormatIndicator] = useState<boolean>(false); // Default to false (Binary)
  const [subscriptionIdentifier, setSubscriptionIdentifier] = useState<
    number | undefined
  >(undefined);
  const [userProperties, setUserProperties] = useState<UserProperty[]>([
    { key: "", value: "" },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const isAtBottom = () => {
    if (!containerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight <= 10;
  };
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
        setEnableProperties(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    let parsedUserProps: Record<string, string | string[]> | undefined;
    if (enableProperties && userProperties.some(p => p.key || p.value)) {
      parsedUserProps = userProperties.reduce((acc, prop) => {
        if (prop.key && prop.value) {
          acc[prop.key] = prop.value; // Simplified to string for now, adjust if array support is needed
        }
        return acc;
      }, {} as Record<string, string | string[]>);
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
              topicAlias,
              contentType: contentType || undefined,
              responseTopic: responseTopic || undefined,
              correlationData: correlationData
                ? Buffer.from(correlationData, "base64")
                : undefined,
              payloadFormatIndicator, // Now boolean: false = Binary, true = UTF-8
              subscriptionIdentifier,
              userProperties: parsedUserProps,
            }
          : undefined,
    };

    onPublish(options);
    setPayload('{"message": "Hello MQTT!"}');
  };

  const addUserProperty = () => {
    setUserProperties([...userProperties, { key: "", value: "" }]);
  };

  const removeUserProperty = (index: number) => {
    const newProperties = userProperties.filter((_, i) => i !== index);
    setUserProperties(newProperties.length ? newProperties : [{ key: "", value: "" }]);
  };

  const updateUserProperty = (index: number, field: keyof UserProperty, value: string) => {
    const newProperties = [...userProperties];
    newProperties[index][field] = value;
    setUserProperties(newProperties);
  };

  const togglePayloadFormat = () => {
    setPayloadFormatIndicator((prev) => !prev); // Toggle between false (Binary) and true (UTF-8)
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-2 sm:space-y-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-xs sm:text-sm">
            Chưa có tin nhắn nào. Hãy chọn một topic để bắt đầu gửi tin nhắn.
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
                    ? "ring-2 ring-purple-500 scale-[1.02]"
                    : "hover:ring hover:ring-purple-400 hover:scale-[1.01]"
                }`}
                style={{
                  borderColor: msg.color,
                  borderStyle: "solid",
                  borderWidth: "1px",
                  boxShadow: isExpanded ? `0 0 8px ${msg.color}` : undefined,
                }}
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(msg.id, msg)}
                >
                  <div className="flex items-center flex-1 min-w-0 pr-1 sm:pr-3">
                    {isPublished ? (
                      <ArrowUpFromDot
                        size={14}
                        className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: msg.color }}
                      />
                    ) : (
                      <MessageSquare
                        size={14}
                        className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: msg.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs opacity-70 block">
                        {msg.timestamp}
                      </span>
                      <h4
                        className="font-semibold truncate text-xs sm:text-sm"
                        style={{ color: msg.color }}
                      >
                        {msg.topic}
                      </h4>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown
                      size={16}
                      className="opacity-70 w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: msg.color }}
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="opacity-70 w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: msg.color }}
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
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition ${
                            viewFormat === fmt
                              ? "bg-purple-600 text-white"
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
        className="p-2 sm:p-4 border-t border-gray-800 bg-gray-950 space-y-2 sm:space-y-3"
      >
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            className="bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-xl border border-gray-700 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
            placeholder="Nhập topic muốn gửi tin nhắn"
            value={publishTopic}
            onChange={(e) => setPublishTopic(e.target.value)}
            disabled={!isConnected}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              className="flex-1 bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-xl border border-gray-700 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
              placeholder="Nhập payload (JSON, HEX, Base64, v.v.)"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              disabled={!isConnected}
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 sm:px-6 py-2 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center w-full sm:w-auto text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected || !publishTopic.trim() || !payload.trim()}
              aria-label="Gửi tin nhắn"
            >
              <Send
                size={12}
                className="mr-1 w-3 h-3 sm:w-4 sm:h-4"
              />
              Gửi
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs sm:text-sm items-center">
          <select
            className="bg-gray-800 text-white px-3 py-2 rounded-xl border border-gray-700 min-w-[100px] sm:min-w-[110px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="bg-gray-800 text-white px-3 py-2 rounded-xl border border-gray-700 w-[90px] sm:w-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={qos}
            onChange={(e) => setQos(Number(e.target.value) as 0 | 1 | 2)}
            disabled={!isConnected}
          >
            <option value={0}>QoS 0</option>
            <option value={1}>QoS 1</option>
            <option value={2}>QoS 2</option>
          </select>

          <label className="inline-flex items-center text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 bg-gray-800"
              checked={retain}
              onChange={(e) => setRetain(e.target.checked)}
              disabled={!isConnected}
            />
            <span className="ml-1 sm:ml-2 text-gray-300">Retain</span>
          </label>

          {protocolVersion === 5 && (
            <Button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-xl shadow-md hover:shadow-lg flex items-center text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setEnableProperties(true);
                setShowPopup(true);
              }}
              disabled={!isConnected}
            >
              <Settings size={12} className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
              Cài đặt MQTT5
            </Button>
          )}
        </div>

        {/* MQTT5 Properties Popup */}
        {protocolVersion === 5 && showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={popupRef} className="bg-gray-900 rounded-2xl w-full max-w-md mx-2 sm:mx-4 shadow-2xl border border-gray-700">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
                  Cài đặt thuộc tính MQTT5
                </h3>
                <div className="space-y-3 text-xs sm:text-sm max-h-[calc(60vh-100px)] overflow-y-auto">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Message Expiry Interval (s) (No default)"
                    className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-full"
                    value={messageExpiryInterval ?? ""}
                    onChange={(e) =>
                      setMessageExpiryInterval(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    disabled={!isConnected}
                  />
                  <Input
                    type="number"
                    min={0}
                    max={65535}
                    placeholder="Topic Alias (0-65535) (No default)"
                    className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-full"
                    value={topicAlias ?? ""}
                    onChange={(e) =>
                      setTopicAlias(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    disabled={!isConnected}
                  />
                  <Input
                    type="text"
                    placeholder="Content Type (e.g., application/json) (No default)"
                    className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-full"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    disabled={!isConnected}
                  />
                  <Input
                    type="text"
                    placeholder="Response Topic (No default)"
                    className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-full"
                    value={responseTopic}
                    onChange={(e) => setResponseTopic(e.target.value)}
                    disabled={!isConnected}
                  />
                  <Input
                    type="text"
                    placeholder="Correlation Data (Base64) (No default)"
                    className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-full"
                    value={correlationData}
                    onChange={(e) => setCorrelationData(e.target.value)}
                    disabled={!isConnected}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Subscription Identifier (No default)"
                    className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-full"
                    value={subscriptionIdentifier ?? ""}
                    onChange={(e) =>
                      setSubscriptionIdentifier(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    disabled={!isConnected}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-xs sm:text-sm">Payload Format Indicator</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={payloadFormatIndicator}
                        onChange={togglePayloadFormat}
                        disabled={!isConnected}
                      />
                      <div
                        className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                      ></div>
                      <span className="ml-2 text-xs sm:text-sm text-gray-400">
                        {payloadFormatIndicator ? "UTF-8 Text" : "Binary"}
                      </span>
                    </label>
                  </div>
                  <div>
                    <h4 className="text-white mb-2">User Properties</h4>
                    {userProperties.map((prop, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          type="text"
                          placeholder="Key"
                          className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-1/2"
                          value={prop.key}
                          onChange={(e) => updateUserProperty(index, "key", e.target.value)}
                          disabled={!isConnected}
                        />
                        <Input
                          type="text"
                          placeholder="Value"
                          className="bg-gray-800 text-white px-3 py-2 rounded-xl border-2 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 w-1/2"
                          value={prop.value}
                          onChange={(e) => updateUserProperty(index, "value", e.target.value)}
                          disabled={!isConnected}
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-xl text-xs sm:text-sm"
                            onClick={() => removeUserProperty(index)}
                            disabled={!isConnected}
                          >
                            <Trash size={12} className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-xl text-xs sm:text-sm flex items-center"
                      onChange={addUserProperty}
                      disabled={!isConnected}
                    >
                      <Plus size={12} className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                      Thêm
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-gray-700">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg text-xs sm:text-sm"
                    onClick={() => {
                      setShowPopup(false);
                      setEnableProperties(false);
                    }}
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg text-xs sm:text-sm"
                    onClick={() => setShowPopup(false)}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MqttChatBox;