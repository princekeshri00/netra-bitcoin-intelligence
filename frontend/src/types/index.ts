export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PatternType = 'peeling_chain' | 'coinjoin' | 'anomaly' | 'fan_out' | 'fan_in';
export type EntityType = 'wallet' | 'transaction';

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type PaginatedResponse<T> = Paginated<T>;

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

// ---- Datasets ----

export interface Dataset {
  dataset_id: string;
  source_format: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  stats: {
    transactions: number;
    wallets: number;
    unique_ips: number;
    unique_asns: number;
    unique_countries: number;
    records_valid: number;
    records_errored: number;
  };
}

export type DatasetDetail = Dataset;

// ---- Transactions ----

export interface TransactionSummary {
  txid: string;
  timestamp: string;
  block_height: number;
  total_input_amount: number;
  total_output_amount: number;
  fee: number;
  input_count: number;
  output_count: number;
  is_coinbase: boolean;
  script_type: string;
  src_ip: string;
}

export type TransactionListItem = TransactionSummary;

export interface TransactionDetail extends TransactionSummary {
  block_hash: string;
  transaction_index: number;
  version: number;
  locktime: number;
  transaction_size: number;
  transaction_weight: number;
  src_port: number;
  dst_ip: string;
  dst_port: number;
}

// ---- Wallets ----

export interface WalletSummary {
  address: string;
  first_seen: string;
  last_seen: string;
  tx_count: number;
  total_received: number;
  total_sent: number;
  risk_score: number;
  risk_level: RiskLevel;
}

export type WalletListItem = WalletSummary;

export interface WalletProfile extends WalletSummary {
  cluster_id?: string;
}

export interface WalletRisk {
  address: string;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  components: Record<string, number>;
  weights: Record<string, number>;
}

export type WalletRiskBreakdown = WalletRisk;

export interface Counterparty {
  address: string;
  tx_count: number;
  total_volume: number;
}

// ---- Graph ----

export interface GraphNode {
  id: string;
  type: EntityType;
  label: string;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: {
    amount?: number;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type GraphResponse = GraphData;

export interface ShortestPathResult {
  path: string[];
  length: number;
  graph: GraphData;
}

// ---- Alerts ----

export interface TopFeature {
  feature: string;
  z_score: number;
}

export interface EvidenceData {
  score?: number;
  top_features?: TopFeature[];
  chain_count?: number;
  avg_chain_length?: number;
  avg_peel_fraction?: number;
  txids?: string[];
  seed_wallet?: string;
  hop_distance?: number;
  propagated_score?: number;
  path?: string[];
}

export interface AlertSummary {
  alert_id: string;
  entity_type: EntityType;
  entity_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  pattern_types: PatternType[];
  created_at: string;
}

export type AlertItem = AlertSummary;

export interface EvidenceItem {
  evidence_type: string;
  description: string;
  weight: number;
  data: EvidenceData;
}

export interface AlertEvidence {
  alert_id: string;
  evidence: EvidenceItem[];
}

export type AlertEvidenceResponse = AlertEvidence;

export interface PropagationHop {
  hop: number;
  wallet: string;
  txid: string;
  score: number;
}

export interface AlertPropagation {
  alert_id: string;
  target_wallet: string;
  propagation_path: {
    seed_wallet: string;
    seed_score: number;
    hops: PropagationHop[];
  };
}

export type AlertPropagationResponse = AlertPropagation;

// ---- Clusters ----

export interface ClusterInfo {
  clusterId: string;
  name: string;
  primaryRiskType: string;
  walletCount: number;
  riskScore: number;
  totalVolumeBtc: number;
  associatedIps: string[];
  topAddresses: string[];
}

// ---- Stream ----

export interface StreamTransaction {
  txid: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: string;
  ip: string;
  country: string;
  isAnomalous: boolean;
  anomalyScore: number;
}

// ---- Analysis pipeline ----

export interface AnalysisJob {
  job_id: string;
  dataset_id: string;
  status: 'pending' | 'running' | 'done' | 'failed' | string;
  current_stage?: string;
  stages_completed?: string[];
  stages_remaining?: string[];
  started_at: string;
  completed_at: string | null;
}

export interface AnalysisStats {
  job_id: string;
  dataset_id: string;
  stats: {
    transactions_processed: number;
    wallets_discovered: number;
    anomalies_detected: number;
    peeling_chains_detected: number;
    coinjoin_like_detected: number;
    entity_clusters: number;
    alerts_generated: number;
    critical_alerts: number;
    high_alerts: number;
    medium_alerts: number;
  };
}