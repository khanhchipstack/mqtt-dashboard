"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Rss, Plus, ListPlus } from "lucide-react";
import { generateSubscriptionId } from "@/utils/idGenerator";
import TopicDisplayCard from "./TopDisplayCard";
import { Button } from "@/components/ui/button";
import { SubscribeOptions, ISubscribePacket } from "@/types/mqtt";

// Predefined list of colors that complement the dark theme
const COLORS = [
  "#60A5FA", // Soft Blue
  "#34D399", // Emerald Green
  "#FBBF24", // Amber Yellow
  "#F472B6", // Rose Pink
  "#2DD4BF", // Teal
  "#818CF8", // Indigo
  "#F59E0B", // Orange
  "#A78BFA", // Purple
  "#22D3EE", // Cyan
  "#A3E635", // Lime Green
];

interface SubscribeSectionProps {
  onSubscribe: (options: SubscribeOptions) => void;
  isConnected: boolean;
  activeSubscriptions: SubscribeOptions[];
  onUnsubscribe: (id: string, topic: string) => void;
  selectedTopics: SubscribeOptions[];
  toggleSelectedTopic: (topic: SubscribeOptions) => void;
}

const SubscribeSection: React.FC<SubscribeSectionProps> = ({
  onSubscribe,
  isConnected,
  activeSubscriptions,
  onUnsubscribe,
  selectedTopics,
  toggleSelectedTopic,
}) => {
  const getRandomString = () => {
    return Math.random().toString(36).substring(2, 8); // Lấy chuỗi ngẫu nhiên 6 ký tự
  };
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [topic, setTopic] = useState(`/testtopic/${getRandomString()}`);
  const [qos, setQos] = useState<0 | 1 | 2>(0);
  const [alias, setAlias] = useState("");
  const [noLocal, setNoLocal] = useState(false);
  const [retainAsPublished, setRetainAsPublished] = useState(false);
  const [retainHandling, setRetainHandling] = useState<0 | 1 | 2>(0);
  const [subscriptionIdentifier, setSubscriptionIdentifier] = useState<number | undefined>(undefined);
  const [properties, setProperties] = useState<ISubscribePacket['properties'] | undefined>(undefined);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Topic cannot be empty.");
      return;
    }
  
    // Lọc các màu chưa được sử dụng
    const usedColors = activeSubscriptions.map((sub) => sub.color);
    const availableColors = COLORS.filter((color) => !usedColors.includes(color));
  
    // Nếu còn màu chưa dùng, lấy màu đầu tiên; hết màu thì random từ toàn bộ bộ màu
    const randomColor =
      availableColors.length > 0
        ? availableColors[0]
        : COLORS[Math.floor(Math.random() * COLORS.length)];
  
    const newSubscription: SubscribeOptions = {
      id: generateSubscriptionId(),
      topic,
      qos,
      alias: alias || topic,
      color: randomColor,
      nl: noLocal,
      rap: retainAsPublished,
      rh: retainHandling,
      properties,
    };
  
    onSubscribe(newSubscription);
  
    setTopic(`/testtopic/${getRandomString()}`);
    setAlias("");
    setQos(0);
    setNoLocal(false);
    setRetainAsPublished(false);
    setRetainHandling(0);
    setSubscriptionIdentifier(undefined);
    setProperties(undefined);
    setIsFormDialogOpen(false);
  };
  

  return (
    <div className="p-4 bg-gray-900 border-gray-800 h-full flex flex-col">
      {/* Mobile Layout: Single Button with Popup */}
      <div className="md:hidden">
        <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
              aria-label="Manage subscriptions"
            >
              <Rss size={18} className="animate-pulse" />
              Manage Subscriptions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs sm:max-w-lg bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl text-green-400 flex items-center mb-4">
                <Rss className="mr-2 w-5 h-5" />
                Subscriptions
              </DialogTitle>
            </DialogHeader>

            {/* Subscription List */}
            <div className="max-h-64 overflow-y-auto bg-gray-800 rounded-lg border border-gray-700 p-2 sm:p-4">
              {activeSubscriptions.length === 0 ? (
                <p className="text-gray-400 text-center text-sm">
                  Chưa đăng ký subscription nào.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {activeSubscriptions.map((sub) => (
                    <TopicDisplayCard
                      key={sub.id}
                      subscription={sub}
                      onUnsubscribe={onUnsubscribe}
                      isChecked={selectedTopics.some((t) => t.id === sub.id)}
                      onToggleCheck={() => toggleSelectedTopic(sub)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add Subscription Button */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={activeSubscriptions.length >= 5}
                  className="mt-4 w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:shadow-green-500/20"
                  aria-label="Add new subscription"
                >
                  <Plus size={18} className="animate-pulse" />
                  Thêm Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs sm:max-w-lg bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl text-green-400 flex items-center mb-4">
                    <ListPlus className="mr-2 w-5 h-5" />
                    New Subscription
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Topic:
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 py-2 px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      disabled={!isConnected}
                      placeholder="Enter MQTT Topic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      QoS:
                    </label>
                    <select
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                      value={qos}
                      onChange={(e) =>
                        setQos(Number(e.target.value) as 0 | 1 | 2)
                      }
                      disabled={!isConnected}
                    >
                      <option value={0}>0 (At most once)</option>
                      <option value={1}>1 (At least once)</option>
                      <option value={2}>2 (Exactly once)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Alias (Optional):
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 py-2 px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      disabled={!isConnected}
                      placeholder="e.g., Temperature Sensor Data"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      No Local:
                    </label>
                    <select
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                      value={noLocal ? "true" : "false"}
                      onChange={(e) => setNoLocal(e.target.value === "true")}
                      disabled={!isConnected}
                    >
                      <option value="false">False (Receive own messages)</option>
                      <option value="true">True (Do not receive own messages)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Retain As Published:
                    </label>
                    <select
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                      value={retainAsPublished ? "true" : "false"}
                      onChange={(e) => setRetainAsPublished(e.target.value === "true")}
                      disabled={!isConnected}
                    >
                      <option value="false">False (Ignore retain status)</option>
                      <option value="true">True (Keep retain status)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Retain Handling:
                    </label>
                    <select
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                      value={retainHandling}
                      onChange={(e) => setRetainHandling(Number(e.target.value) as 0 | 1 | 2)}
                      disabled={!isConnected}
                    >
                      <option value={0}>0 (Send retained messages)</option>
                      <option value={1}>1 (Send only for new subscriptions)</option>
                      <option value={2}>2 (Do not send retained messages)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Subscription Identifier (Optional):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="268435455"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 py-2 px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                      value={subscriptionIdentifier ?? ""}
                      onChange={(e) =>
                        setSubscriptionIdentifier(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      disabled={!isConnected}
                      placeholder="1 to 268435455"
                    />
                  </div>
                  <DialogFooter className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setIsFormDialogOpen(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all duration-300"
                      aria-label="Cancel adding subscription"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-green-500/20"
                      disabled={!isConnected || topic.trim() === ""}
                      aria-label="Subscribe to topic"
                    >
                      <ListPlus className="mr-2 w-5 h-5" />
                      Subscribe
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Layout: Directly display subscription list and Add button */}
      <div className="hidden md:flex flex-col h-full">
        <h3 className="text-xl font-semibold mb-3 flex items-center border-b border-gray-700 pb-2">
          <Rss className="mr-2 w-5 h-5 text-green-400" />
          Subscriptions
        </h3>
        <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg border border-gray-700 p-2">
          {activeSubscriptions.length === 0 ? (
            <p className="text-gray-400 text-center text-sm">
              Chưa đăng ký subscription nào.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {activeSubscriptions.map((sub) => (
                <TopicDisplayCard
                  key={sub.id}
                  subscription={sub}
                  onUnsubscribe={onUnsubscribe}
                  isChecked={selectedTopics.some((t) => t.id === sub.id)}
                  onToggleCheck={() => toggleSelectedTopic(sub)}
                />
              ))}
            </div>
          )}
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={activeSubscriptions.length >= 5}
              className="mt-3 w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md hover:shadow-green-500/20"
              aria-label="Add new subscription"
            >
              <Plus size={18} className="animate-pulse" />
              Thêm Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs sm:max-w-lg bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl text-green-400 flex items-center mb-4">
                <ListPlus className="mr-2 w-5 h-5" />
                New Subscription
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Topic:
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 py-2 px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  disabled={!isConnected}
                  placeholder="Enter MQTT Topic"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">QoS:</label>
                <select
                  className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                  value={qos}
                  onChange={(e) => setQos(Number(e.target.value) as 0 | 1 | 2)}
                  disabled={!isConnected}
                >
                  <option value={0}>0 (At most once)</option>
                  <option value={1}>1 (At least once)</option>
                  <option value={2}>2 (Exactly once)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Alias (Optional):
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 py-2 px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  disabled={!isConnected}
                  placeholder="e.g., Temperature Sensor Data"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  No Local:
                </label>
                <select
                  className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                  value={noLocal ? "true" : "false"}
                  onChange={(e) => setNoLocal(e.target.value === "true")}
                  disabled={!isConnected}
                >
                  <option value="false">False (Receive own messages)</option>
                  <option value="true">True (Do not receive own messages)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Retain As Published:
                </label>
                <select
                  className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                  value={retainAsPublished ? "true" : "false"}
                  onChange={(e) => setRetainAsPublished(e.target.value === "true")}
                  disabled={!isConnected}
                >
                  <option value="false">False (Ignore retain status)</option>
                  <option value="true">True (Keep retain status)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Retain Handling:
                </label>
                <select
                  className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                  value={retainHandling}
                  onChange={(e) => setRetainHandling(Number(e.target.value) as 0 | 1 | 2)}
                  disabled={!isConnected}
                >
                  <option value={0}>0 (Send retained messages)</option>
                  <option value={1}>1 (Send only for new subscriptions)</option>
                  <option value={2}>2 (Do not send retained messages)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Subscription Identifier (Optional):
                </label>
                <input
                  type="number"
                  min="1"
                  max="268435455"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 py-2 px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-sm"
                  value={subscriptionIdentifier ?? ""}
                  onChange={(e) =>
                    setSubscriptionIdentifier(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  disabled={!isConnected}
                  placeholder="1 to 268435455"
                />
              </div>
              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setIsFormDialogOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all duration-300"
                  aria-label="Cancel adding subscription"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-green-500/20"
                  disabled={!isConnected || topic.trim() === ""}
                  aria-label="Subscribe to topic"
                >
                  <ListPlus className="mr-2 w-5 h-5" />
                  Subscribe
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubscribeSection;