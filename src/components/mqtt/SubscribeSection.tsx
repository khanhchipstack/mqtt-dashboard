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
import { Radio, ListPlus, Rss, Plus } from "lucide-react";
import { generateSubscriptionId } from "@/utils/idGenerator"; // NEW import for ID
import TopicDisplayCard from "./TopDisplayCard";
import { Button } from "@/components/ui/button";
import { SubscribeOptions } from "@/types/mqtt";
interface SubscribeSectionProps {
  onSubscribe: (options: SubscribeOptions) => void;
  isConnected: boolean;
  activeSubscriptions: SubscribeOptions[];
  onUnsubscribe: (id: string, topic: string) => void; // Pass unsubscribe here
  onSelectTopic: (topic: SubscribeOptions) => void; // NEW: Callback to select a topic
  selectedTopic: SubscribeOptions | null; // NEW: Currently selected topic
}

const SubscribeSection: React.FC<SubscribeSectionProps> = ({
  onSubscribe,
  isConnected,
  activeSubscriptions,
  onUnsubscribe,
  onSelectTopic,
  selectedTopic,
}) => {
  const [topic, setTopic] = useState("testtopic/react");
  const [qos, setQos] = useState<0 | 1 | 2>(0);
  const [alias, setAlias] = useState("");
  const [color, setColor] = useState("#93E172"); // Default color
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Topic cannot be empty.");
      return;
    }

    const newSubscription: SubscribeOptions = {
      id: generateSubscriptionId(),
      topic,
      qos,
      alias: alias || topic,
      color,
    };

    onSubscribe(newSubscription);

    // Reset form
    setTopic("");
    setAlias("");
    setQos(0);

    // Đóng popup
    setIsDialogOpen(false);
  };

  return (
    <div className="px-2 sm:px-4 py-2 sm:py-4 bg-gray-900 rounded-2xl shadow-2xl flex flex-col h-full border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-6 pb-1 sm:pb-2 border-b border-gray-700">
        <h2 className="text-lg sm:text-2xl font-bold text-green-400 flex items-center">
          <Radio
            size={18}
            className="mr-1 sm:mr-3 text-green-400 w-5 h-5 sm:w-6 sm:h-6"
          />
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={activeSubscriptions.length === 5}
              className="h-7 sm:h-8 bg-green-600 hover:bg-green-700 text-white px-1 sm:px-2 py-1 sm:py-2 rounded-lg flex items-center text-xs sm:text-sm shadow-md hover:shadow-green-500/20 transition"
            >
              <Plus className="mr-0.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Add
              Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs sm:max-w-md bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-3 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl text-green-400 flex items-center mb-2 sm:mb-4">
                <ListPlus className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> New
                Subscription
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubscribe} className="space-y-2 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-300 mb-0.5 sm:mb-1">
                  Topic:
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 py-1 sm:py-2 px-2 sm:px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  disabled={!isConnected}
                  placeholder="Enter MQTT Topic"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-300 mb-0.5 sm:mb-1">
                  QoS:
                </label>
                <select
                  className="w-full bg-gray-800 text-white py-1 sm:py-2 px-2 sm:px-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
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
                <label className="block text-xs sm:text-sm text-gray-300 mb-0.5 sm:mb-1">
                  Alias (Optional):
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 py-1 sm:py-2 px-2 sm:px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  disabled={!isConnected}
                  placeholder="e.g., Temperature Sensor Data"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-300 mb-0.5 sm:mb-1">
                  Color (for UI):
                </label>
                <input
                  type="color"
                  className="w-full h-8 sm:h-10 py-1 sm:py-4 px-2 sm:px-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={!isConnected}
                />
              </div>

              <DialogFooter className="pt-2 sm:pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white w-full py-1 sm:py-2 rounded-lg shadow-md hover:shadow-green-500/20 text-xs sm:text-sm"
                  disabled={!isConnected || topic.trim() === ""}
                >
                  <ListPlus className="mr-0.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                  Subscribe
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Subscriptions */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 border-b border-gray-700 pb-1 sm:pb-3 flex items-center">
        <Rss
          size={16}
          className="mr-1 sm:mr-2 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5"
        />{" "}
        Active Subscriptions
      </h3>

      <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg border border-gray-700 shadow-inner p-1 sm:p-2">
        {activeSubscriptions.length === 0 ? (
          <p className="text-gray-400 text-center p-1 sm:p-2 text-xs sm:text-sm">
            No active subscriptions. Add one above!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:gap-4">
            {activeSubscriptions.map((sub) => (
              <TopicDisplayCard
                key={sub.id}
                subscription={sub}
                onUnsubscribe={onUnsubscribe}
                onSelectTopic={onSelectTopic}
                isSelected={selectedTopic?.id === sub.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribeSection;
