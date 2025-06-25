// src/utils/mqtt/idGenerator.ts
export const generateUniqueId = (): string => {
    return `conn_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  export const generateSubscriptionId = (): string => {
    return `sub_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  export const generateMessageId = (): string => {
    return `msg_${Math.random().toString(36).substr(2, 9)}`;
  };
  export const generateClientId = (): string => {
    return `client_${Math.random().toString(36).substr(2, 9)}`;
  };