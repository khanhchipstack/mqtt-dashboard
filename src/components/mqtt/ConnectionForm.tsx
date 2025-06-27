import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SavedConnection } from "@/types/connection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings,
  Plug,
  Zap,
  Info,
  Wifi,
  MessageSquareText,
  FileLock,
  Globe,
  Lock,
  ChevronUp,
  ChevronDown,
  Hash,
  Fingerprint,
  RefreshCw,
  User,
  X,
  Clock,
  Timer,
  Save,
} from "lucide-react";
import { generateClientId } from "@/utils/idGenerator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Switch } from "@/components/ui/switch";
import { MqttConnectionOptions } from "@/types/mqtt";

interface ConnectionFormProps {
  onConnect: (options: MqttConnectionOptions) => void;
  onDisconnect: () => void;
  connectionStatus: string;
  connection: SavedConnection | Omit<SavedConnection, "id"> | null; // Can be a saved connection or a new unsaved one
  onSave: (newConnection: Omit<SavedConnection, "id">) => void; // For saving completely new connections
  onUpdate: (id: string, updatedFields: Partial<SavedConnection>) => void; // For updating existing connections
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  onConnect,
  onDisconnect,
  connectionStatus,
  connection,
  onSave,
  onUpdate,
  isExpanded,
  onToggleExpand,
  onClose,
}) => {
  // --- State for Connection Options ---
  const [name, setName] = useState("");
  const [host, setHost] = useState("haplocalhostroxy");
  const [port, setPort] = useState<number>(9003);
  const [clientId, setClientId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clean, setClean] = useState(true);
  const [keepalive, setKeepalive] = useState<number>(60);
  const [connectTimeout, setConnectTimeout] = useState<number>(10000);
  const [reconnectPeriod, setReconnectPeriod] = useState<number>(0);
  const [protocol, setProtocol] = useState<"mqtt" | "mqtts" | "ws" | "wss">(
    "ws"
  );
  const [useSsl, setUseSsl] = useState(false); // Default to false

  // MQTT 5 Properties
  const [protocolVersion, setProtocolVersion] = useState<4 | 5>(4);
  const [sessionExpiryInterval, setSessionExpiryInterval] = useState<
    number | undefined
  >(undefined);
  const [receiveMaximum, setReceiveMaximum] = useState<number | undefined>(
    undefined
  );
  const [maximumPacketSize, setMaximumPacketSize] = useState<
    number | undefined
  >(undefined);
  const [topicAliasMaximum, setTopicAliasMaximum] = useState<
    number | undefined
  >(undefined);
  const [requestResponseInformation, setRequestResponseInformation] = useState<
    boolean | undefined
  >(undefined);
  const [requestProblemInformation, setRequestProblemInformation] = useState<
    boolean | undefined
  >(undefined);
  const [userProperties, setUserProperties] = useState<string>(""); // Stored as JSON string

  // Will Message
  const [willTopic, setWillTopic] = useState("");
  const [willPayload, setWillPayload] = useState("");
  const [willQos, setWillQos] = useState<0 | 1 | 2>(0);
  const [willRetain, setWillRetain] = useState(false);

  // Will MQTT 5 Properties
  const [willDelayInterval, setWillDelayInterval] = useState<
    number | undefined
  >(undefined);
  const [willMessageExpiryInterval, setWillMessageExpiryInterval] = useState<
    number | undefined
  >(undefined);
  const [willContentType, setWillContentType] = useState("");
  const [willResponseTopic, setWillResponseTopic] = useState("");
  const [willCorrelationData, setWillCorrelationData] = useState(""); // Base64 encoded
  const [willPayloadFormatIndicator, setWillPayloadFormatIndicator] = useState<
    boolean | undefined
  >(undefined);
  const [willUserProperties, setWillUserProperties] = useState<string>(""); // Stored as JSON string

  // SSL/TLS Certificates
  const [rejectUnauthorized, setRejectUnauthorized] = useState(true);
  const [ca, setCa] = useState("");
  const [cert, setCert] = useState("");
  const [key, setKey] = useState("");

  // --- Helper to get Connection Options from current state ---
  const getMqttConnectionOptions = useCallback((): MqttConnectionOptions => {
    let connectProperties: { [key: string]: any } | undefined;
    if (protocolVersion === 5) {
      try {
        const parsedUserProperties = userProperties
          ? JSON.parse(userProperties)
          : undefined;
        connectProperties = {
          sessionExpiryInterval: sessionExpiryInterval,
          receiveMaximum: receiveMaximum,
          maximumPacketSize: maximumPacketSize,
          topicAliasMaximum: topicAliasMaximum,
          requestResponseInformation: requestResponseInformation,
          requestProblemInformation: requestProblemInformation,
          userProperties: parsedUserProperties,
        };
      } catch (e) {
        toast.error("Invalid JSON for Connect User Properties.");
        throw new Error("Invalid Connect User Properties JSON");
      }
    }

    let willProperties: { [key: string]: any } | undefined;
    if (willTopic && protocolVersion === 5) {
      try {
        const parsedWillUserProperties = willUserProperties
          ? JSON.parse(willUserProperties)
          : undefined;
        willProperties = {
          willDelayInterval: willDelayInterval,
          messageExpiryInterval: willMessageExpiryInterval,
          contentType: willContentType || undefined,
          responseTopic: willResponseTopic || undefined,
          correlationData: willCorrelationData || undefined,
          payloadFormatIndicator: willPayloadFormatIndicator,
          userProperties: parsedWillUserProperties,
        };
      } catch (e) {
        toast.error("Invalid JSON for Will User Properties.");
        throw new Error("Invalid Will User Properties JSON");
      }
    }

    // Determine the effective protocol based on useSsl
    let effectiveProtocol = protocol;
    if (useSsl && !protocol.endsWith("s")) {
      effectiveProtocol = protocol === "mqtt" ? "mqtts" : "wss";
    } else if (!useSsl && protocol.endsWith("s")) {
      effectiveProtocol = protocol === "mqtts" ? "mqtt" : "ws";
    }

    return {
      protocol: effectiveProtocol,
      host,
      port,
      clientId,
      username,
      password,
      clean,
      keepalive,
      connectTimeout,
      reconnectPeriod,
      protocolVersion,
      properties: connectProperties,
      will: willTopic
        ? {
            topic: willTopic,
            payload: willPayload,
            qos: willQos,
            retain: willRetain,
            properties: willProperties,
          }
        : undefined,
      ca,
      cert,
      rejectUnauthorized,
      key,
    };
  }, [
    host,
    port,
    clientId,
    username,
    password,
    clean,
    keepalive,
    connectTimeout,
    reconnectPeriod,
    protocol,
    useSsl,
    protocolVersion,
    sessionExpiryInterval,
    receiveMaximum,
    maximumPacketSize,
    topicAliasMaximum,
    requestResponseInformation,
    requestProblemInformation,
    userProperties,
    willTopic,
    willPayload,
    willQos,
    willRetain,
    willDelayInterval,
    willMessageExpiryInterval,
    willContentType,
    willResponseTopic,
    willCorrelationData,
    willPayloadFormatIndicator,
    willUserProperties,
    rejectUnauthorized,
    ca,
    cert,
    key,
  ]);

  // --- Effect to load connection data when `connection` prop changes ---
  useEffect(() => {
    if (connection) {
      setName(connection.name);
      setHost(connection.options.host || "localhost");
      setPort(connection.options.port || 9003);
      setClientId(connection.options.clientId || generateClientId());
      setUsername(connection.options.username || "");
      setPassword(connection.options.password || "");
      setClean(connection.options.clean ?? true);
      setKeepalive(connection.options.keepalive ?? 60);
      setConnectTimeout(connection.options.connectTimeout ?? 10000);
      setReconnectPeriod(connection.options.reconnectPeriod ?? 0);

      // Determine initial protocol and useSsl
      const initialProtocol = connection.options.protocol || "ws";
      setProtocol(initialProtocol);
      // Ensure useSsl is always a boolean.
      setUseSsl(initialProtocol.endsWith("ss") || false); // Add || false to ensure it's boolean

      setProtocolVersion(connection.options.protocolVersion || 4);

      // MQTT 5 Properties
      const connProps = connection.options.properties;
      setSessionExpiryInterval(connProps?.sessionExpiryInterval);
      setReceiveMaximum(connProps?.receiveMaximum);
      setMaximumPacketSize(connProps?.maximumPacketSize);
      setTopicAliasMaximum(connProps?.topicAliasMaximum);
      setRequestResponseInformation(connProps?.requestResponseInformation);
      setRequestProblemInformation(connProps?.requestProblemInformation);
      setUserProperties(
        connProps?.userProperties
          ? JSON.stringify(connProps.userProperties, null, 2)
          : ""
      ); // Stringify object back to JSON for display

      // Will Message
      const will = connection.options.will;
      setWillTopic(will?.topic || "");
      setWillPayload(will?.payload || "");
      setWillQos(will?.qos ?? 0);
      setWillRetain(will?.retain ?? false);

      // Will MQTT 5 Properties
      const willProps = will?.properties;
      setWillDelayInterval(willProps?.willDelayInterval);
      setWillMessageExpiryInterval(willProps?.messageExpiryInterval);
      setWillContentType(willProps?.contentType || "");
      setWillResponseTopic(willProps?.responseTopic || "");
      setWillCorrelationData(willProps?.correlationData || ""); // Stored as string from form
      setWillPayloadFormatIndicator(willProps?.payloadFormatIndicator);
      setWillUserProperties(
        willProps?.userProperties
          ? JSON.stringify(willProps.userProperties, null, 2)
          : ""
      ); // Stringify object back to JSON

      // SSL/TLS Certificates
      setRejectUnauthorized(connection.options.rejectUnauthorized ?? true);
      setCa(connection.options.ca || "");
      setCert(connection.options.cert || "");
      setKey(connection.options.key || "");
    } else {
      // Reset to default values for a new connection
      setName(`New Connection ${new Date().toLocaleTimeString()}`);
      setHost("localhost");
      setPort(9003);
      setClientId(generateClientId());
      setUsername("");
      setPassword("");
      setClean(true);
      setKeepalive(60);
      setConnectTimeout(10000);
      setReconnectPeriod(0);
      setProtocol("ws");
      setUseSsl(false); // Ensure it's false for new connection

      setProtocolVersion(4);
      setSessionExpiryInterval(undefined);
      setReceiveMaximum(undefined);
      setMaximumPacketSize(undefined);
      setTopicAliasMaximum(undefined);
      setRequestResponseInformation(undefined);
      setRequestProblemInformation(undefined);
      setUserProperties("");

      setWillTopic("");
      setWillPayload("");
      setWillQos(0);
      setWillRetain(false);

      setWillDelayInterval(undefined);
      setWillMessageExpiryInterval(undefined);
      setWillContentType("");
      setWillResponseTopic("");
      setWillCorrelationData("");
      setWillPayloadFormatIndicator(undefined);
      setWillUserProperties("");

      setRejectUnauthorized(true);
      setCa("");
      setCert("");
      setKey("");
    }
  }, [connection]); // Dependency on connection prop

  // --- Handlers ---
  const handleProtocolChange = (value: string) => {
    const newProtocol = value as "mqtt" | "mqtts" | "ws" | "wss";
    setProtocol(newProtocol);
    setUseSsl(newProtocol.endsWith("ss")); // Update useSsl based on protocol
  };

  const handleSslChange = (check: boolean) => {
    const isChecked = check;
    setUseSsl(isChecked);
    // Adjust protocol based on SSL checkbox
    if (isChecked && !protocol.endsWith("s")) {
      setProtocol(protocol === "mqtt" ? "mqtts" : "wss");
    } else if (!isChecked && protocol.endsWith("s")) {
      setProtocol(protocol === "mqtts" ? "mqtt" : "ws");
    }
  };

  const handleConnectClick = () => {
    try {
      const options = getMqttConnectionOptions();
      onConnect(options);
      // No need to save here, page.tsx handles saving of new connections on connect
    } catch (e: any) {
      // Error message already shown by toast in getMqttConnectionOptions
      console.error("Connection attempt failed:", e);
    }
  };

  const handleSaveClick = () => {
    try {
      const options = getMqttConnectionOptions();
      const connToSave: Omit<SavedConnection, "id"> = {
        name,
        options,
        subscriptions:
          connection && "subscriptions" in connection
            ? connection.subscriptions
            : [],
      };

      if (connection && "id" in connection && connection.id) {
        // Updating existing connection
        onUpdate(connection.id, connToSave);
        toast.success("Connection updated successfully!");
      } else {
        // Saving a new connection
        onSave(connToSave);
        toast.success("New connection saved!");
      }
    } catch (e: any) {
      // Error message already shown by toast in getMqttConnectionOptions
      console.error("Save failed:", e);
    }
  };

  const isNewConnection = !connection || !("id" in connection);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl shadow-xl border border-gray-800 backdrop-blur-lg bg-opacity-80 transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Settings size={24} className="text-indigo-500 animate-pulse" />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Connection Settings
          </span>
        </h2>
        <Button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-all duration-300 hover:bg-gray-800 rounded-xl p-2.5"
          variant="ghost"
        >
          <X className="h-5 w-5 transition-transform duration-300" />
        </Button>
      </div>

      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "item-1" : ""}
        className="w-full"
      >
        <AccordionItem value="item-1">
          <AccordionContent className="p-0 overflow-visible">
            <ScrollArea className="h-[450px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Connection Name */}
                <div className="col-span-2 group">
                  <div className="flex items-center mb-2">
                    <Label
                      htmlFor="connectionName"
                      className="text-gray-200 font-medium"
                    >
                      Connection Name
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 h-4 w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px] bg-gray-800 text-white border-gray-700">
                        A friendly name to identify this connection
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="connectionName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Connection"
                    className="bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg"
                  />
                </div>

                {/* Host and Port */}
                <div className="group">
                  <Label htmlFor="host" className="text-gray-200 font-medium">
                    Host
                  </Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="host"
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="broker.example.com"
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="group">
                  <Label htmlFor="port" className="text-gray-200 font-medium">
                    Port
                  </Label>
                  <div className="relative mt-2">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="port"
                      type="number"
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      placeholder="1883"
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Client ID */}
                <div className="col-span-2 group">
                  <div className="flex items-center mb-2">
                    <Label
                      htmlFor="clientId"
                      className="text-gray-200 font-medium"
                    >
                      Client ID
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 h-4 w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px] bg-gray-800 text-white border-gray-700">
                        Leave empty to generate a random client ID
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="clientId"
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50 rounded-full p-1 transition-all duration-200"
                      onClick={() =>
                        setClientId(
                          `mqttx_${Math.random().toString(16).substr(2, 8)}`
                        )
                      }
                    >
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Username and Password */}
                <div className="group">
                  <Label
                    htmlFor="username"
                    className="text-gray-200 font-medium"
                  >
                    Username
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Optional"
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="group">
                  <Label
                    htmlFor="password"
                    className="text-gray-200 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Optional"
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg"
                    />
                    {password && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50 rounded-full p-1 transition-all duration-200"
                        onClick={() => setPassword("")}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Protocol and SSL */}
                <div className="group">
                  <Label
                    htmlFor="protocol"
                    className="text-gray-200 font-medium"
                  >
                    Protocol
                  </Label>
                  <Select value={protocol} onValueChange={handleProtocolChange}>
                    <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg transition-all duration-300">
                      <SelectValue placeholder="Select Protocol" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white rounded-lg">
                      <SelectItem
                        value="ws"
                        className="hover:bg-indigo-500/20 focus:bg-indigo-500/20 transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <Globe className="mr-2 h-5 w-5 text-indigo-400" />{" "}
                          WebSocket
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="wss"
                        className="hover:bg-indigo-500/20 focus:bg-indigo-500/20 transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <Lock className="mr-2 h-5 w-5 text-indigo-400" />{" "}
                          WebSocket Secure
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="group">
                  <Label
                    htmlFor="keepalive"
                    className="text-gray-200 font-medium"
                  >
                    Keep Alive (seconds)
                  </Label>
                  <div className="relative mt-2">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="keepalive"
                      type="number"
                      value={keepalive}
                      onChange={(e) => setKeepalive(Number(e.target.value))}
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white transition-all duration-300 rounded-lg"
                      min={0}
                    />
                  </div>
                </div>

                {/* Connect Timeout & Reconnect Period */}
                <div className="group">
                  <Label
                    htmlFor="connectTimeout"
                    className="text-gray-200 font-medium"
                  >
                    Connect Timeout (ms)
                  </Label>
                  <div className="relative mt-2">
                    <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="connectTimeout"
                      type="number"
                      value={connectTimeout}
                      onChange={(e) =>
                        setConnectTimeout(Number(e.target.value))
                      }
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white transition-all duration-300 rounded-lg"
                      min={0}
                    />
                  </div>
                </div>
                <div className="group">
                  <Label
                    htmlFor="reconnectPeriod"
                    className="text-gray-200 font-medium"
                  >
                    Reconnect Period (ms)
                  </Label>
                  <div className="relative mt-2">
                    <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="reconnectPeriod"
                      type="number"
                      value={reconnectPeriod}
                      onChange={(e) =>
                        setReconnectPeriod(Number(e.target.value))
                      }
                      className="pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white transition-all duration-300 rounded-lg"
                      min={0}
                    />
                  </div>
                </div>
                <div className="flex items-center group">
                  <Switch
                    id="clean-session"
                    checked={clean}
                    onCheckedChange={(checked) => setClean(checked)}
                    className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                  />
                  <Label
                    htmlFor="clean-session"
                    className="ml-3 text-gray-200 font-medium group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                  >
                    Clean Session
                  </Label>
                </div>

                <div className="flex items-center group">
                  <Switch
                    id="ssl-toggle"
                    checked={useSsl}
                    onCheckedChange={(check) => handleSslChange(check)}
                    className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                  />
                  <Label
                    htmlFor="ssl-toggle"
                    className="ml-3 text-gray-200 font-medium group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                  >
                    Use SSL/TLS
                  </Label>
                </div>

                {/* MQTT 5.0 Properties */}
                <div className="col-span-2 mt-8">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="item-2"
                      className="border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline text-white text-lg font-semibold flex items-center bg-gray-800/50">
                        <Zap
                          size={20}
                          className="mr-2 text-yellow-400 animate-pulse"
                        />
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          MQTT 5.0 Connection Properties
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-gray-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="group">
                            <Label
                              htmlFor="protocolVersion"
                              className="text-gray-200 font-medium"
                            >
                              Protocol Version
                            </Label>
                            <Select
                              value={String(protocolVersion)}
                              onValueChange={(val) =>
                                setProtocolVersion(Number(val) as 4 | 5)
                              }
                            >
                              <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-800 text-white rounded-lg">
                                <SelectItem value="4">
                                  4.0 (MQTT 3.1.1)
                                </SelectItem>
                                <SelectItem value="5">5.0 (MQTT 5)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {protocolVersion === 5 && (
                            <>
                              <div className="group">
                                <Label
                                  htmlFor="sessionExpiryInterval"
                                  className="text-gray-200 font-medium"
                                >
                                  Session Expiry Interval (s)
                                </Label>
                                <Input
                                  id="sessionExpiryInterval"
                                  type="number"
                                  value={sessionExpiryInterval ?? ""}
                                  onChange={(e) =>
                                    setSessionExpiryInterval(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="Optional"
                                  min={0}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="receiveMaximum"
                                  className="text-gray-200 font-medium"
                                >
                                  Receive Maximum
                                </Label>
                                <Input
                                  id="receiveMaximum"
                                  type="number"
                                  value={receiveMaximum ?? ""}
                                  onChange={(e) =>
                                    setReceiveMaximum(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="Optional"
                                  min={0}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="maximumPacketSize"
                                  className="text-gray-200 font-medium"
                                >
                                  Maximum Packet Size
                                </Label>
                                <Input
                                  id="maximumPacketSize"
                                  type="number"
                                  value={maximumPacketSize ?? ""}
                                  onChange={(e) =>
                                    setMaximumPacketSize(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="Optional"
                                  min={0}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="topicAliasMaximum"
                                  className="text-gray-200 font-medium"
                                >
                                  Topic Alias Maximum
                                </Label>
                                <Input
                                  id="topicAliasMaximum"
                                  type="number"
                                  value={topicAliasMaximum ?? ""}
                                  onChange={(e) =>
                                    setTopicAliasMaximum(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="Optional"
                                  min={0}
                                />
                              </div>
                              <div className="flex items-center group">
                                <Switch
                                  id="requestResponseInformation"
                                  checked={requestResponseInformation ?? false}
                                  onCheckedChange={(checked) =>
                                    setRequestResponseInformation(checked)
                                  }
                                  className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                />
                                <Label
                                  htmlFor="requestResponseInformation"
                                  className="ml-3 text-gray-200 font-medium group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                                >
                                  Request Response Information
                                </Label>
                              </div>
                              <div className="flex items-center group">
                                <Switch
                                  id="requestProblemInformation"
                                  checked={requestProblemInformation ?? false}
                                  onCheckedChange={(checked) =>
                                    setRequestProblemInformation(checked)
                                  }
                                  className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                />
                                <Label
                                  htmlFor="requestProblemInformation"
                                  className="ml-3 text-gray-200 font-medium group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                                >
                                  Request Problem Information
                                </Label>
                              </div>
                              <div className="col-span-2 group">
                                <Label
                                  htmlFor="userProperties"
                                  className="text-gray-200 font-medium"
                                >
                                  User Properties (JSON)
                                </Label>
                                <Textarea
                                  id="userProperties"
                                  value={userProperties}
                                  onChange={(e) =>
                                    setUserProperties(e.target.value)
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[100px] rounded-lg"
                                  placeholder={`{\n  "key1": "value1",\n  "key2": "value2"\n}`}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Will Message */}
                <div className="col-span-2 mt-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="item-3"
                      className="border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline text-white text-lg font-semibold flex items-center bg-gray-800/50">
                        <MessageSquareText
                          size={20}
                          className="mr-2 text-green-400 animate-pulse"
                        />
                        <span className="bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
                          Will Message
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-gray-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="group">
                            <Label
                              htmlFor="willTopic"
                              className="text-gray-200 font-medium"
                            >
                              Will Topic
                            </Label>
                            <Input
                              id="willTopic"
                              type="text"
                              value={willTopic}
                              onChange={(e) => setWillTopic(e.target.value)}
                              className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                              placeholder="e.g., /client/disconnect"
                            />
                          </div>
                          <div className="group">
                            <Label
                              htmlFor="willPayload"
                              className="text-gray-200 font-medium"
                            >
                              Will Payload
                            </Label>
                            <Input
                              id="willPayload"
                              type="text"
                              value={willPayload}
                              onChange={(e) => setWillPayload(e.target.value)}
                              className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                              placeholder="e.g., Client disconnected"
                            />
                          </div>
                          <div className="group">
                            <Label
                              htmlFor="willQos"
                              className="text-gray-200 font-medium"
                            >
                              Will QoS
                            </Label>
                            <Select
                              value={String(willQos)}
                              onValueChange={(val) =>
                                setWillQos(Number(val) as 0 | 1 | 2)
                              }
                            >
                              <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-800 text-white rounded-lg">
                                <SelectItem value="0">
                                  0 (At most once)
                                </SelectItem>
                                <SelectItem value="1">
                                  1 (At least once)
                                </SelectItem>
                                <SelectItem value="2">
                                  2 (Exactly once)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center group">
                            <Switch
                              id="willRetain"
                              checked={willRetain}
                              onCheckedChange={(checked) =>
                                setWillRetain(checked)
                              }
                              className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                            />
                            <Label
                              htmlFor="willRetain"
                              className="ml-3 text-gray-200 font-medium group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                            >
                              Will Retain
                            </Label>
                          </div>

                          {protocolVersion === 5 && willTopic && (
                            <>
                              <div className="col-span-2 border-t border-gray-800 pt-4 mt-4">
                                <h4 className="text-md font-semibold text-gray-200 mb-2">
                                  MQTT 5.0 Will Properties
                                </h4>
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willDelayInterval"
                                  className="text-gray-200 font-medium"
                                >
                                  Will Delay Interval (s)
                                </Label>
                                <Input
                                  id="willDelayInterval"
                                  type="number"
                                  value={willDelayInterval ?? ""}
                                  onChange={(e) =>
                                    setWillDelayInterval(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="Optional"
                                  min={0}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willMessageExpiryInterval"
                                  className="text-gray-200 font-medium"
                                >
                                  Message Expiry Interval (s)
                                </Label>
                                <Input
                                  id="willMessageExpiryInterval"
                                  type="number"
                                  value={willMessageExpiryInterval ?? ""}
                                  onChange={(e) =>
                                    setWillMessageExpiryInterval(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="Optional"
                                  min={0}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willContentType"
                                  className="text-gray-200 font-medium"
                                >
                                  Content Type
                                </Label>
                                <Input
                                  id="willContentType"
                                  type="text"
                                  value={willContentType}
                                  onChange={(e) =>
                                    setWillContentType(e.target.value)
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="e.g., application/json"
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willResponseTopic"
                                  className="text-gray-200 font-medium"
                                >
                                  Response Topic
                                </Label>
                                <Input
                                  id="willResponseTopic"
                                  type="text"
                                  value={willResponseTopic}
                                  onChange={(e) =>
                                    setWillResponseTopic(e.target.value)
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="e.g., /response/topic"
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willCorrelationData"
                                  className="text-gray-200 font-medium"
                                >
                                  Correlation Data (Base64)
                                </Label>
                                <Input
                                  id="willCorrelationData"
                                  type="text"
                                  value={willCorrelationData}
                                  onChange={(e) =>
                                    setWillCorrelationData(e.target.value)
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg"
                                  placeholder="Base64 encoded string"
                                />
                              </div>
                              <div className="flex items-center group">
                                <Switch
                                  id="willPayloadFormatIndicator"
                                  checked={willPayloadFormatIndicator ?? false}
                                  onCheckedChange={(checked) =>
                                    setWillPayloadFormatIndicator(checked)
                                  }
                                  className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                />
                                <Label
                                  htmlFor="willPayloadFormatIndicator"
                                  className="ml-3 text-gray-200 font-medium group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                                >
                                  Payload Format Indicator
                                </Label>
                              </div>
                              <div className="col-span-2 group">
                                <Label
                                  htmlFor="willUserProperties"
                                  className="text-gray-200 font-medium"
                                >
                                  User Properties (JSON)
                                </Label>
                                <Textarea
                                  id="willUserProperties"
                                  value={willUserProperties}
                                  onChange={(e) =>
                                    setWillUserProperties(e.target.value)
                                  }
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[100px] rounded-lg"
                                  placeholder={`{\n  "key1": "value1",\n  "key2": "value2"\n}`}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* SSL/TLS Certificates */}
                <div className="col-span-2 mt-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="item-4"
                      className="border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline text-white text-lg font-semibold flex items-center bg-gray-800/50">
                        <FileLock
                          size={20}
                          className="mr-2 text-red-400 animate-pulse"
                        />
                        <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                          SSL/TLS Certificates
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-gray-900/50">
                        <div className="grid grid-cols-1 gap-y-6">
                          <div className="flex items-center group">
                            <Switch
                              id="rejectUnauthorized"
                              checked={rejectUnauthorized}
                              onCheckedChange={(checked) =>
                                setRejectUnauthorized(checked)
                              }
                              className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                            />
                            <Label
                              htmlFor="rejectUnauthorized"
                              className="ml-3 text-gray-200 font-medium group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                            >
                              Reject Unauthorized Certificates
                            </Label>
                          </div>
                          {rejectUnauthorized && (
                            <>
                              <div className="group">
                                <Label
                                  htmlFor="caCert"
                                  className="text-gray-200 font-medium"
                                >
                                  CA Certificate (Base64)
                                </Label>
                                <Textarea
                                  id="caCert"
                                  value={ca}
                                  onChange={(e) => setCa(e.target.value)}
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[100px] rounded-lg"
                                  placeholder="Paste your CA certificate in Base64 format"
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="clientCert"
                                  className="text-gray-200 font-medium"
                                >
                                  Client Certificate (Base64)
                                </Label>
                                <Textarea
                                  id="clientCert"
                                  value={cert}
                                  onChange={(e) => setCert(e.target.value)}
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[100px] rounded-lg"
                                  placeholder="Paste your client certificate in Base64 format"
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="clientKey"
                                  className="text-gray-200 font-medium"
                                >
                                  Client Key (Base64)
                                </Label>
                                <Textarea
                                  id="clientKey"
                                  value={key}
                                  onChange={(e) => setKey(e.target.value)}
                                  className="mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[100px] rounded-lg"
                                  placeholder="Paste your client key in Base64 format"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4 border-t border-gray-800 pt-4">
        {connectionStatus === "Connected" ? (
          <Button
            onClick={onDisconnect}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-red-500/30"
          >
            <Plug size={22} className="mr-2" /> Disconnect
          </Button>
        ) : (
          <Button
            onClick={handleConnectClick}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
          >
            <Wifi size={22} className="mr-2" /> Connect
          </Button>
        )}
        <Button
          onClick={handleSaveClick}
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-green-500/30"
        >
          <Save size={22} className="mr-2" />{" "}
          {isNewConnection ? "Save New Connection" : "Update Connection"}
        </Button>
      </div>
    </div>
  );
};

export default ConnectionForm;
