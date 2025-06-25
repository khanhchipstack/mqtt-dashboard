export interface BrokerInfoProps {
    data: {
      nodes: NodeData[]
      brokers: BrokerData[]
      metrics: MetricsData
      prometheus: PrometheusMetrics
    } | null
  }