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
} from "lucide-react";
import { generateClientId } from "@/utils/idGenerator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { Switch } from "@/components/ui/switch";
import { MqttConnectionOptions } from "@/types/mqtt";

interface ConnectionFormProps {
  onConnect: (options: MqttConnectionOptions) => void;
  onDisconnect: () => void;
  connectionStatus: string;
  connection: SavedConnection | null;
  onSave: (newConnection: SavedConnection) => void;
  onUpdate: (updatedFields: Partial<SavedConnection>) => void;
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
  const [host, setHost] = useState("freemqtt.chipstack.vn");
  const [port, setPort] = useState<number>(8884);
  const [clientId, setClientId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cleanSession, setCleanSession] = useState(true); // MQTT 3.1.1
  const [cleanStart, setCleanStart] = useState(true); // MQTT 5.0
  const [keepalive, setKeepalive] = useState<number>(60);
  const [connectTimeout, setConnectTimeout] = useState<number>(30000);
  const [reconnectPeriod, setReconnectPeriod] = useState<number>(1000);
  const [protocol, setProtocol] = useState<
    "mqtt" | "mqtts" | "ws" | "wss" | string
  >("mqtt");
  const [protocolVersion, setProtocolVersion] = useState<4 | 5>(4);
  const [useSsl, setUseSsl] = useState(false);
  const [rejectUnauthorized, setRejectUnauthorized] = useState(true);
  const [ca, setCa] = useState("");
  const [cert, setCert] = useState("");
  const [key, setKey] = useState("");

  // MQTT 5 Properties
  const [sessionExpiryInterval, setSessionExpiryInterval] = useState<
    number | undefined
  >(0);
  const [receiveMaximum, setReceiveMaximum] = useState<number | undefined>(
    65535
  );
  const [maximumPacketSize, setMaximumPacketSize] = useState<
    number | undefined
  >(undefined);
  const [topicAliasMaximum, setTopicAliasMaximum] = useState<
    number | undefined
  >(0);
  const [requestResponseInformation, setRequestResponseInformation] = useState<
    boolean | undefined
  >(false);
  const [requestProblemInformation, setRequestProblemInformation] = useState<
    boolean | undefined
  >(true);
  const [userProperties, setUserProperties] = useState<string>("");

  // Will Message
  const [willTopic, setWillTopic] = useState("");
  const [willPayload, setWillPayload] = useState("");
  const [willQos, setWillQos] = useState<0 | 1 | 2>(0);
  const [willRetain, setWillRetain] = useState(false);
  const [willDelayInterval, setWillDelayInterval] = useState<
    number | undefined
  >(0);
  const [willMessageExpiryInterval, setWillMessageExpiryInterval] = useState<
    number | undefined
  >(undefined);
  const [willContentType, setWillContentType] = useState("");
  const [willResponseTopic, setWillResponseTopic] = useState("");
  const [willCorrelationData, setWillCorrelationData] = useState("");
  const [willPayloadFormatIndicator, setWillPayloadFormatIndicator] = useState<
    boolean | undefined
  >(false);
  const [willUserProperties, setWillUserProperties] = useState<string>("");

  const isConnected = connectionStatus === "Connected";
  const isDisabled = isConnected;

  // --- Helper to get Connection Options from current state ---
  const getMqttConnectionOptions = useCallback((): MqttConnectionOptions => {
    // Validate Response Topic
    const isValidTopic = (topic: string) => {
      return topic.length > 0 && !/[#+]/.test(topic); // Basic MQTT topic validation
    };
    if (willResponseTopic && !isValidTopic(willResponseTopic)) {
      toast.error("Invalid Response Topic for Will Message.");
      throw new Error("Invalid Response Topic for Will Message.");
    }

    // Validate Base64 fields
    const isValidBase64 = (str: string) => {
      try {
        return str && Buffer.from(str, "base64").toString("base64") === str;
      } catch {
        return false;
      }
    };
    if (ca && !isValidBase64(ca)) {
      toast.error("Invalid CA Certificate (must be Base64-encoded).");
      throw new Error("Invalid CA Certificate (must be Base64-encoded).");
    }
    if (cert && !isValidBase64(cert)) {
      toast.error("Invalid Client Certificate (must be Base64-encoded).");
      throw new Error("Invalid Client Certificate (must be Base64-encoded).");
    }
    if (key && !isValidBase64(key)) {
      toast.error("Invalid Client Key (must be Base64-encoded).");
      throw new Error("Invalid Client Key (must be Base64-encoded).");
    }
    if (willCorrelationData && !isValidBase64(willCorrelationData)) {
      toast.error("Invalid Correlation Data (must be Base64-encoded).");
      throw new Error("Invalid Correlation Data (must be Base64-encoded).");
    }

    let connectProperties: { [key: string]: any } | undefined;
    if (protocolVersion === 5) {
      connectProperties = {
        cleanStart,
        sessionExpiryInterval,
        receiveMaximum,
        maximumPacketSize,
        topicAliasMaximum,
        requestResponseInformation,
        requestProblemInformation,
        userProperties: userProperties
          ? (() => {
              try {
                return JSON.parse(userProperties);
              } catch {
                toast.error(
                  "Invalid JSON for Connect User Properties. Using empty object."
                );
                return {};
              }
            })()
          : undefined,
      };
    }

    let willProperties: { [key: string]: any } | undefined;
    if (willTopic && protocolVersion === 5) {
      willProperties = {
        willDelayInterval,
        messageExpiryInterval: willMessageExpiryInterval,
        contentType: willContentType || undefined,
        responseTopic: willResponseTopic || undefined,
        correlationData: willCorrelationData
          ? Buffer.from(willCorrelationData, "base64")
          : undefined,
        payloadFormatIndicator: willPayloadFormatIndicator,
        userProperties: willUserProperties
          ? (() => {
              try {
                return JSON.parse(willUserProperties);
              } catch {
                toast.error(
                  "Invalid JSON for Will User Properties. Using empty object."
                );
                return {};
              }
            })()
          : undefined,
      };
    }

    let effectiveProtocol = protocol;
    if (useSsl && !protocol.endsWith("s")) {
      effectiveProtocol = protocol === "mqtt" ? "mqtts" : "wss";
    } else if (!useSsl && protocol.endsWith("s")) {
      effectiveProtocol = protocol === "mqtts" ? "mqtt" : "ws";
    }

    return {
      protocol: effectiveProtocol as "mqtt" | "mqtts" | "ws" | "wss",
      host,
      port,
      clientId,
      username,
      password,
      clean: cleanSession, // For MQTT 3.1.1
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
    cleanSession,
    cleanStart,
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
  // Inside ConnectionForm component
  useEffect(() => {
    if (connection) {
      setName(connection.name);
      setHost(connection.options.host || "freemqtt.chipstack.vn");
      setPort(connection.options.port || 8884);
      setClientId(connection.options.clientId || generateClientId());
      setUsername(connection.options.username || "");
      setPassword(connection.options.password || "");
      setCleanSession(connection.options.clean ?? true);
      setCleanStart(connection.options.properties?.cleanStart ?? true);
      setKeepalive(connection.options.keepalive ?? 60);
      setConnectTimeout(connection.options.connectTimeout ?? 30000);
      setReconnectPeriod(connection.options.reconnectPeriod ?? 1000);
  
      const initialProtocol = connection.options.protocol || "mqtt";
      setProtocol(initialProtocol);
      setUseSsl(initialProtocol.endsWith("s") || false);
  
      setProtocolVersion(connection.options.protocolVersion || 4);
  
      const connProps = connection.options.properties || {};
      setSessionExpiryInterval(connProps.sessionExpiryInterval ?? 0);
      setReceiveMaximum(connProps.receiveMaximum ?? 65535);
      setMaximumPacketSize(connProps.maximumPacketSize ?? undefined);
      setTopicAliasMaximum(connProps.topicAliasMaximum ?? 0);
      setRequestResponseInformation(connProps.requestResponseInformation ?? false);
      setRequestProblemInformation(connProps.requestProblemInformation ?? true);
      setUserProperties(
        connProps.userProperties ? JSON.stringify(connProps.userProperties, null, 2) : ""
      );
  
      if (connection.options.will) {
        setWillTopic(connection.options.will.topic || "");
        setWillPayload(connection.options.will.payload || "");
        setWillQos(connection.options.will.qos ?? 0);
        setWillRetain(connection.options.will.retain ?? false);
  
        const willProps = connection.options.will.properties || {};
        setWillDelayInterval(willProps.willDelayInterval ?? 0);
        setWillMessageExpiryInterval(willProps.messageExpiryInterval ?? undefined);
        setWillContentType(willProps.contentType || "");
        setWillResponseTopic(willProps.responseTopic || "");
        // Explicitly handle correlationData to ensure string output
        setWillCorrelationData(
          willProps.correlationData
            ? Buffer.isBuffer(willProps.correlationData)
              ? willProps.correlationData.toString('base64')
              : String(willProps.correlationData)
            : ""
        );
        setWillPayloadFormatIndicator(willProps.payloadFormatIndicator ?? false);
        setWillUserProperties(
          willProps.userProperties ? JSON.stringify(willProps.userProperties, null, 2) : ""
        );
      } else {
        setWillTopic("");
        setWillPayload("");
        setWillQos(0);
        setWillRetain(false);
        setWillDelayInterval(0);
        setWillMessageExpiryInterval(undefined);
        setWillContentType("");
        setWillResponseTopic("");
        setWillCorrelationData("");
        setWillPayloadFormatIndicator(false);
        setWillUserProperties("");
      }
  
      setRejectUnauthorized(connection.options.rejectUnauthorized ?? true);
      setCa(connection.options.ca || "");
      setCert(connection.options.cert || "");
      setKey(connection.options.key || "");
    } else {
      setName(`New Connection ${new Date().toLocaleTimeString()}`);
      setHost("freemqtt.chipstack.vn");
      setPort(8884);
      setClientId(generateClientId());
      setUsername("");
      setPassword("");
      setCleanSession(true);
      setCleanStart(true);
      setKeepalive(60);
      setConnectTimeout(30000);
      setReconnectPeriod(1000);
      setProtocol("mqtt");
      setUseSsl(false);
  
      setProtocolVersion(4);
      setSessionExpiryInterval(0);
      setReceiveMaximum(65535);
      setMaximumPacketSize(undefined);
      setTopicAliasMaximum(0);
      setRequestResponseInformation(false);
      setRequestProblemInformation(true);
      setUserProperties("");
  
      setWillTopic("");
      setWillPayload("");
      setWillQos(0);
      setWillRetain(false);
      setWillDelayInterval(0);
      setWillMessageExpiryInterval(undefined);
      setWillContentType("");
      setWillResponseTopic("");
      setWillCorrelationData("");
      setWillPayloadFormatIndicator(false);
      setWillUserProperties("");
  
      setRejectUnauthorized(true);
      setCa("");
      setCert("");
      setKey("");
    }
  }, [connection]);

  // --- Handlers ---
  const handleProtocolChange = (value: string) => {
    if (isDisabled) return;
    const newProtocol = value as "mqtt" | "mqtts" | "ws" | "wss";
    setProtocol(newProtocol);
    setUseSsl(newProtocol.endsWith("s"));
  };

  const handleSslChange = (checked: boolean) => {
    if (isDisabled) return;
    setUseSsl(checked);
    if (checked && !protocol.endsWith("s")) {
      setProtocol(protocol === "mqtt" ? "mqtts" : "wss");
    } else if (!checked && protocol.endsWith("s")) {
      setProtocol(protocol === "mqtts" ? "mqtt" : "ws");
    }
  };

  const handleConnectClick = () => {
    try {
      const options = getMqttConnectionOptions();
      const connToSave: SavedConnection = {
        name,
        options,
        subscriptions: connection?.subscriptions || [],
      };

      if (connection) {
        onUpdate(connToSave);
        toast.success("Connection settings updated!");
      } else {
        onSave(connToSave);
        toast.success("New connection saved!");
      }

      onConnect(options);
    } catch (e: any) {
      console.error("Connection attempt failed:", e.message);
      // Error toasts are already handled in getMqttConnectionOptions
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-800 backdrop-blur-lg bg-opacity-80 transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
          <Settings
            size={20}
            className="text-indigo-500 animate-pulse w-5 h-5 sm:w-6 sm:h-6"
          />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Connection Settings
          </span>
        </h2>
        <Button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-all duration-300 hover:bg-gray-800 rounded-xl p-2 sm:p-2.5"
          variant="ghost"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300" />
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
            <ScrollArea className="h-[350px] sm:h-[450px] pr-2 sm:pr-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
                {/* Connection Name */}
                <div className="col-span-1 md:col-span-2 group">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Label
                      htmlFor="connectionName"
                      className="text-gray-200 font-medium text-sm sm:text-base"
                    >
                      Connection Name
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                        A friendly name to identify this connection
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="connectionName"
                    type="text"
                    value={name}
                    onChange={(e) => !isDisabled && setName(e.target.value)}
                    placeholder="My Awesome Connection"
                    className="bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg text-sm sm:text-base"
                    disabled={isDisabled}
                  />
                </div>

                {/* Host and Port */}
                <div className="group">
                  <Label
                    htmlFor="host"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Host
                  </Label>
                  <div className="relative mt-1 sm:mt-2">
                    <Globe className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="host"
                      type="text"
                      value={host}
                      onChange={(e) => !isDisabled && setHost(e.target.value)}
                      placeholder="broker.example.com"
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg text-sm sm:text-base"
                      disabled={isDisabled}
                    />
                  </div>
                </div>
                <div className="group">
                  <Label
                    htmlFor="port"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Port
                  </Label>
                  <div className="relative mt-1 sm:mt-2">
                    <Hash className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="port"
                      type="number"
                      value={port}
                      onChange={(e) =>
                        !isDisabled && setPort(Number(e.target.value))
                      }
                      placeholder="8884"
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg text-sm sm:text-base"
                      disabled={isDisabled}
                    />
                  </div>
                </div>

                {/* Client ID */}
                <div className="col-span-1 md:col-span-2 group">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Label
                      htmlFor="clientId"
                      className="text-gray-200 font-medium text-sm sm:text-base"
                    >
                      Client ID
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                        Leave empty to generate a random client ID (1-65535
                        chars)
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Fingerprint className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="clientId"
                      type="text"
                      value={clientId}
                      onChange={(e) =>
                        !isDisabled && setClientId(e.target.value)
                      }
                      placeholder="Auto-generated if empty"
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg text-sm sm:text-base"
                      disabled={isDisabled}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50 rounded-full p-1 sm:p-1.5 transition-all duration-200"
                      onClick={() =>
                        !isDisabled &&
                        setClientId(
                          `mqttx_${Math.random().toString(16).substr(2, 8)}`
                        )
                      }
                      disabled={isDisabled}
                    >
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>

                {/* Username and Password */}
                <div className="group">
                  <Label
                    htmlFor="username"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Username
                  </Label>
                  <div className="relative mt-1 sm:mt-2">
                    <User className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) =>
                        !isDisabled && setUsername(e.target.value)
                      }
                      placeholder="Optional"
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg text-sm sm:text-base"
                      disabled={isDisabled}
                    />
                  </div>
                </div>
                <div className="group">
                  <Label
                    htmlFor="password"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Password
                  </Label>
                  <div className="relative mt-1 sm:mt-2">
                    <Lock className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) =>
                        !isDisabled && setPassword(e.target.value)
                      }
                      placeholder="Optional"
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all duration-300 rounded-lg text-sm sm:text-base"
                      disabled={isDisabled}
                    />
                    {password && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50 rounded-full p-1 sm:p-1.5 transition-all duration-200"
                        onClick={() => !isDisabled && setPassword("")}
                        disabled={isDisabled}
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Protocol and Keep Alive */}
                <div className="group">
                  <Label
                    htmlFor="protocol"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Protocol
                  </Label>
                  <Select
                    value={protocol}
                    onValueChange={handleProtocolChange}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base">
                      <SelectValue placeholder="Select Protocol" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white rounded-lg">
                      <SelectItem value="mqtt">MQTT</SelectItem>
                      <SelectItem value="mqtts">MQTTS</SelectItem>
                      <SelectItem value="ws">WebSocket</SelectItem>
                      <SelectItem value="wss">WebSocket Secure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="group">
                  <Label
                    htmlFor="keepalive"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Keep Alive (seconds)
                  </Label>
                  <div className="relative mt-1 sm:mt-2">
                    <Clock className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="keepalive"
                      type="number"
                      value={keepalive}
                      onChange={(e) =>
                        !isDisabled &&
                        setKeepalive(
                          Math.min(65535, Math.max(0, Number(e.target.value)))
                        )
                      }
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white transition-all duration-300 rounded-lg text-sm sm:text-base"
                      min="0"
                      max="65535"
                      disabled={isDisabled}
                    />
                  </div>
                </div>

                {/* Connect Timeout & Reconnect Period */}
                <div className="group">
                  <Label
                    htmlFor="connectTimeout"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Connect Timeout (ms)
                  </Label>
                  <div className="relative mt-1 sm:mt-2">
                    <Timer className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="connectTimeout"
                      type="number"
                      value={connectTimeout}
                      onChange={(e) =>
                        !isDisabled &&
                        setConnectTimeout(
                          Math.min(
                            60000,
                            Math.max(1000, Number(e.target.value))
                          )
                        )
                      }
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white transition-all duration-300 rounded-lg text-sm sm:text-base"
                      min="1000"
                      max="60000"
                      disabled={isDisabled}
                    />
                  </div>
                </div>
                <div className="group">
                  <Label
                    htmlFor="reconnectPeriod"
                    className="text-gray-200 font-medium text-sm sm:text-base"
                  >
                    Reconnect Period (ms)
                  </Label>
                  <div className="relative mt-1 sm:mt-2">
                    <RefreshCw className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
                    <Input
                      id="reconnectPeriod"
                      type="number"
                      value={reconnectPeriod}
                      onChange={(e) =>
                        !isDisabled &&
                        setReconnectPeriod(
                          Math.min(60000, Math.max(0, Number(e.target.value)))
                        )
                      }
                      className="pl-7 sm:pl-10 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white transition-all duration-300 rounded-lg text-sm sm:text-base"
                      min="0"
                      max="60000"
                      disabled={isDisabled}
                    />
                  </div>
                </div>

                {/* Clean Session and Clean Start */}
                <div className="flex items-center group col-span-1 md:col-span-2">
                  <Switch
                    id="cleanSession"
                    checked={cleanSession}
                    onCheckedChange={(checked) =>
                      !isDisabled && setCleanSession(checked)
                    }
                    className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                    disabled={isDisabled}
                  />
                  <Label
                    htmlFor="cleanSession"
                    className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                  >
                    Clean Session
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                      Clear old session on reconnect (MQTT 3.1.1)
                    </TooltipContent>
                  </Tooltip>
                </div>
                {protocolVersion === 5 && (
                  <div className="flex items-center group col-span-1 md:col-span-2">
                    <Switch
                      id="cleanStart"
                      checked={cleanStart}
                      onCheckedChange={(checked) =>
                        !isDisabled && setCleanStart(checked)
                      }
                      className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                      disabled={isDisabled}
                    />
                    <Label
                      htmlFor="cleanStart"
                      className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                    >
                      Clean Start
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                        Start a new session (true) or resume existing session
                        (false) (MQTT 5.0)
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

                <div className="flex items-center group col-span-1 md:col-span-2">
                  <Switch
                    id="ssl-toggle"
                    checked={useSsl}
                    onCheckedChange={(checked) => handleSslChange(checked)}
                    className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                    disabled={isDisabled}
                  />
                  <Label
                    htmlFor="ssl-toggle"
                    className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                  >
                    Use SSL/TLS
                  </Label>
                </div>

                {/* MQTT 5.0 Properties */}
                <div className="col-span-1 md:col-span-2 mt-4 sm:mt-8">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="item-2"
                      className="border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline text-white text-sm sm:text-lg font-semibold flex items-center bg-gray-800/50">
                        <Zap
                          size={16}
                          className="mr-1 sm:mr-2 text-yellow-400 animate-pulse w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          MQTT 5.0 Connection Properties
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-2 sm:p-4 bg-gray-900/50">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
                          <div className="group">
                            <Label
                              htmlFor="protocolVersion"
                              className="text-gray-200 font-medium text-sm sm:text-base"
                            >
                              Protocol Version
                            </Label>
                            <Select
                              value={String(protocolVersion)}
                              onValueChange={(val) =>
                                !isDisabled &&
                                setProtocolVersion(Number(val) as 4 | 5)
                              }
                              disabled={isDisabled}
                            >
                              <SelectTrigger className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base">
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
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Session Expiry Interval (s)
                                </Label>
                                <Input
                                  id="sessionExpiryInterval"
                                  type="number"
                                  value={sessionExpiryInterval ?? ""}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setSessionExpiryInterval(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(
                                            4294967295,
                                            Math.max(0, Number(e.target.value))
                                          )
                                    )
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="0 to 4294967295"
                                  min="0"
                                  max="4294967295"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="receiveMaximum"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Receive Maximum
                                </Label>
                                <Input
                                  id="receiveMaximum"
                                  type="number"
                                  value={receiveMaximum ?? ""}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setReceiveMaximum(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(
                                            65535,
                                            Math.max(1, Number(e.target.value))
                                          )
                                    )
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="1 to 65535"
                                  min="1"
                                  max="65535"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="maximumPacketSize"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Maximum Packet Size
                                </Label>
                                <Input
                                  id="maximumPacketSize"
                                  type="number"
                                  value={maximumPacketSize ?? ""}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setMaximumPacketSize(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(
                                            4294967295,
                                            Math.max(0, Number(e.target.value))
                                          )
                                    )
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="0 to 4294967295"
                                  min="0"
                                  max="4294967295"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="topicAliasMaximum"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Topic Alias Maximum
                                </Label>
                                <Input
                                  id="topicAliasMaximum"
                                  type="number"
                                  value={topicAliasMaximum ?? ""}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setTopicAliasMaximum(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(
                                            65535,
                                            Math.max(0, Number(e.target.value))
                                          )
                                    )
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="0 to 65535"
                                  min="0"
                                  max="65535"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="flex items-center group col-span-1 md:col-span-2">
                                <Switch
                                  id="requestResponseInformation"
                                  checked={requestResponseInformation ?? false}
                                  onCheckedChange={(checked) =>
                                    !isDisabled &&
                                    setRequestResponseInformation(checked)
                                  }
                                  className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                  disabled={isDisabled}
                                />
                                <Label
                                  htmlFor="requestResponseInformation"
                                  className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                                >
                                  Request Response Information
                                </Label>
                              </div>
                              <div className="flex items-center group col-span-1 md:col-span-2">
                                <Switch
                                  id="requestProblemInformation"
                                  checked={requestProblemInformation ?? false}
                                  onCheckedChange={(checked) =>
                                    !isDisabled &&
                                    setRequestProblemInformation(checked)
                                  }
                                  className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                  disabled={isDisabled}
                                />
                                <Label
                                  htmlFor="requestProblemInformation"
                                  className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                                >
                                  Request Problem Information
                                </Label>
                              </div>
                              <div className="group col-span-1 md:col-span-2">
                                <Label
                                  htmlFor="userProperties"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  User Properties (JSON)
                                </Label>
                                <Textarea
                                  id="userProperties"
                                  value={userProperties}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setUserProperties(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[80px] sm:min-h-[100px] rounded-lg text-sm sm:text-base"
                                  placeholder={`{\n  "key1": "value1",\n  "key2": "value2"\n}`}
                                  disabled={isDisabled}
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
                <div className="col-span-1 md:col-span-2 mt-4 sm:mt-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="item-3"
                      className="border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline text-white text-sm sm:text-lg font-semibold flex items-center bg-gray-800/50">
                        <MessageSquareText
                          size={16}
                          className="mr-1 sm:mr-2 text-green-400 animate-pulse w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
                          Will Message
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-2 sm:p-4 bg-gray-900/50">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
                          <div className="group">
                            <Label
                              htmlFor="willTopic"
                              className="text-gray-200 font-medium text-sm sm:text-base"
                            >
                              Will Topic
                            </Label>
                            <Input
                              id="willTopic"
                              type="text"
                              value={willTopic}
                              onChange={(e) =>
                                !isDisabled && setWillTopic(e.target.value)
                              }
                              className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                              placeholder="e.g., /client/disconnect"
                              disabled={isDisabled}
                            />
                          </div>
                          <div className="group">
                            <Label
                              htmlFor="willPayload"
                              className="text-gray-200 font-medium text-sm sm:text-base"
                            >
                              Will Payload
                            </Label>
                            <Input
                              id="willPayload"
                              type="text"
                              value={willPayload}
                              onChange={(e) =>
                                !isDisabled && setWillPayload(e.target.value)
                              }
                              className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                              placeholder="e.g., Client disconnected"
                              disabled={isDisabled}
                            />
                          </div>
                          <div className="group">
                            <Label
                              htmlFor="willQos"
                              className="text-gray-200 font-medium text-sm sm:text-base"
                            >
                              Will QoS
                            </Label>
                            <Select
                              value={String(willQos)}
                              onValueChange={(val) =>
                                !isDisabled &&
                                setWillQos(Number(val) as 0 | 1 | 2)
                              }
                              disabled={isDisabled}
                            >
                              <SelectTrigger className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base">
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
                          <div className="flex items-center group col-span-1 md:col-span-2">
                            <Switch
                              id="willRetain"
                              checked={willRetain}
                              onCheckedChange={(checked) =>
                                !isDisabled && setWillRetain(checked)
                              }
                              className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                              disabled={isDisabled}
                            />
                            <Label
                              htmlFor="willRetain"
                              className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                            >
                              Will Retain
                            </Label>
                          </div>

                          {protocolVersion === 5 && willTopic && (
                            <>
                              <div className="col-span-1 md:col-span-2 border-t border-gray-800 pt-2 sm:pt-4 mt-2 sm:mt-4">
                                <h4 className="text-sm sm:text-md font-semibold text-gray-200 mb-1 sm:mb-2">
                                  MQTT 5.0 Will Properties
                                </h4>
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willDelayInterval"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Will Delay Interval (s)
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                                    Delay before the broker publishes the will
                                    message after client disconnection
                                  </TooltipContent>
                                </Tooltip>
                                <Input
                                  id="willDelayInterval"
                                  type="number"
                                  value={willDelayInterval ?? ""}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setWillDelayInterval(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(
                                            4294967295,
                                            Math.max(0, Number(e.target.value))
                                          )
                                    )
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="0 to 4294967295"
                                  min="0"
                                  max="4294967295"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willMessageExpiryInterval"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Message Expiry Interval (s)
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                                    Lifetime of the will message after it is
                                    published
                                  </TooltipContent>
                                </Tooltip>
                                <Input
                                  id="willMessageExpiryInterval"
                                  type="number"
                                  value={willMessageExpiryInterval ?? ""}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setWillMessageExpiryInterval(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(
                                            4294967295,
                                            Math.max(0, Number(e.target.value))
                                          )
                                    )
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="0 to 4294967295"
                                  min="0"
                                  max="4294967295"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willContentType"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Content Type
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                                    Describes the format of the will payload
                                    (e.g., application/json)
                                  </TooltipContent>
                                </Tooltip>
                                <Input
                                  id="willContentType"
                                  type="text"
                                  value={willContentType}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setWillContentType(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="e.g., application/json"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willResponseTopic"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Response Topic
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                                    Topic for responses to the will message
                                  </TooltipContent>
                                </Tooltip>
                                <Input
                                  id="willResponseTopic"
                                  type="text"
                                  value={willResponseTopic}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setWillResponseTopic(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="e.g., /response/topic"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="willCorrelationData"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Correlation Data (Base64)
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                                    Binary data for correlating requests and
                                    responses (Base64-encoded)
                                  </TooltipContent>
                                </Tooltip>
                                <Input
                                  id="willCorrelationData"
                                  type="text"
                                  value={willCorrelationData}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setWillCorrelationData(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white rounded-lg text-sm sm:text-base"
                                  placeholder="Base64 encoded string"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="flex items-center group col-span-1 md:col-span-2">
                                <Switch
                                  id="willPayloadFormatIndicator"
                                  checked={willPayloadFormatIndicator ?? false}
                                  onCheckedChange={(checked) =>
                                    !isDisabled &&
                                    setWillPayloadFormatIndicator(checked)
                                  }
                                  className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                  disabled={isDisabled}
                                />
                                <Label
                                  htmlFor="willPayloadFormatIndicator"
                                  className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                                >
                                  Payload Format Indicator
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                                    Indicates if the will payload is UTF-8
                                    encoded (true) or unspecified (false)
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="group col-span-1 md:col-span-2">
                                <Label
                                  htmlFor="willUserProperties"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  User Properties (JSON)
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[250px] sm:max-w-[300px] bg-gray-800 text-white border-gray-700">
                                    Custom key-value pairs for
                                    application-specific metadata
                                  </TooltipContent>
                                </Tooltip>
                                <Textarea
                                  id="willUserProperties"
                                  value={willUserProperties}
                                  onChange={(e) =>
                                    !isDisabled &&
                                    setWillUserProperties(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[80px] sm:min-h-[100px] rounded-lg text-sm sm:text-base"
                                  placeholder={`{\n  "key1": "value1",\n  "key2": "value2"\n}`}
                                  disabled={isDisabled}
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
                <div className="col-span-1 md:col-span-2 mt-4 sm:mt-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="item-4"
                      className="border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline text-white text-sm sm:text-lg font-semibold flex items-center bg-gray-800/50">
                        <FileLock
                          size={16}
                          className="mr-1 sm:mr-2 text-red-400 animate-pulse w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                          SSL/TLS Certificates
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-2 sm:p-4 bg-gray-900/50">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                          <div className="flex items-center group">
                            <Switch
                              id="rejectUnauthorized"
                              checked={rejectUnauthorized}
                              onCheckedChange={(checked) =>
                                !isDisabled && setRejectUnauthorized(checked)
                              }
                              className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                              disabled={isDisabled}
                            />
                            <Label
                              htmlFor="rejectUnauthorized"
                              className="ml-2 sm:ml-3 text-gray-200 font-medium text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                            >
                              Reject Unauthorized Certificates
                            </Label>
                          </div>
                          {rejectUnauthorized && (
                            <>
                              <div className="group">
                                <Label
                                  htmlFor="caCert"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  CA Certificate (Base64)
                                </Label>
                                <Textarea
                                  id="caCert"
                                  value={ca}
                                  onChange={(e) =>
                                    !isDisabled && setCa(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[80px] sm:min-h-[100px] rounded-lg text-sm sm:text-base"
                                  placeholder="Paste your CA certificate in Base64 format"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="clientCert"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Client Certificate (Base64)
                                </Label>
                                <Textarea
                                  id="clientCert"
                                  value={cert}
                                  onChange={(e) =>
                                    !isDisabled && setCert(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[80px] sm:min-h-[100px] rounded-lg text-sm sm:text-base"
                                  placeholder="Paste your client certificate in Base64 format"
                                  disabled={isDisabled}
                                />
                              </div>
                              <div className="group">
                                <Label
                                  htmlFor="clientKey"
                                  className="text-gray-200 font-medium text-sm sm:text-base"
                                >
                                  Client Key (Base64)
                                </Label>
                                <Textarea
                                  id="clientKey"
                                  value={key}
                                  onChange={(e) =>
                                    !isDisabled && setKey(e.target.value)
                                  }
                                  className="mt-1 sm:mt-2 bg-gray-800/50 border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white min-h-[80px] sm:min-h-[100px] rounded-lg text-sm sm:text-base"
                                  placeholder="Paste your client key in Base64 format"
                                  disabled={isDisabled}
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
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t border-gray-800 pt-3 sm:pt-4">
        {isConnected ? (
          <Button
            onClick={onDisconnect}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-red-500/30"
          >
            <Plug size={18} className="mr-1 sm:mr-2 w-5 h-5 sm:w-6 sm:h-6" />{" "}
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={handleConnectClick}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
          >
            <Wifi size={18} className="mr-1 sm:mr-2 w-5 h-5 sm:w-6 sm:h-6" />{" "}
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConnectionForm;
