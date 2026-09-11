// Every value here is copied or directly modeled on the example responses
// in the teammate's api.md — not invented shapes. When live mode is on,
// swapping USE_MOCK=false should require zero changes to any component,
// because these mocks are already wire-accurate.

import type {
  Dataset,
  AnalysisJob,
  AnalysisStats,
  Paginated,
  AlertSummary,
  AlertEvidence,
  AlertPropagation,
  GraphData,
  WalletRisk,
} from '../types';

export const mockDataset: Dataset = {
  dataset_id: 'demo_01',
  source_format: 'CSV',
  status: 'done',
  created_at: '2026-09-06T00:00:00Z',
  completed_at: '2026-09-06T00:01:23Z',
  stats: {
    transactions: 10000,
    wallets: 4823,
    unique_ips: 2341,
    unique_asns: 187,
    unique_countries: 42,
    records_valid: 9987,
    records_errored: 13,
  },
};

export const mockJobPending: AnalysisJob = {
  job_id: '550e8400-e29b-41d4-a716-446655440000',
  dataset_id: 'demo_01',
  status: 'running',
  current_stage: 'feature_engineering',
  stages_completed: ['normalization'],
  stages_remaining: ['graph', 'anomaly', 'peeling', 'risk', 'alerts'],
  started_at: '2026-09-06T00:00:00Z',
  completed_at: null,
};

export const mockJobDone: AnalysisJob = {
  ...mockJobPending,
  status: 'done',
  stages_completed: ['normalization', 'graph', 'anomaly', 'peeling', 'risk', 'alerts'],
  stages_remaining: [],
  completed_at: '2026-09-06T00:03:10Z',
};

export const mockAnalysisStats: AnalysisStats = {
  job_id: '550e8400-e29b-41d4-a716-446655440000',
  dataset_id: 'demo_01',
  stats: {
    transactions_processed: 10000,
    wallets_discovered: 4823,
    anomalies_detected: 487,
    peeling_chains_detected: 23,
    coinjoin_like_detected: 15,
    entity_clusters: 312,
    alerts_generated: 47,
    critical_alerts: 5,
    high_alerts: 12,
    medium_alerts: 30,
  },
};

export const mockAlertsPage: Paginated<AlertSummary> = {
  count: 47,
  next: null,
  previous: null,
  results: [
    {
      alert_id: '8f3b6c2a-9e1d-4f7b-8c3a-2e1d4f7b8c3a',
      entity_type: 'wallet',
      entity_id: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      risk_score: 91.5,
      risk_level: 'CRITICAL',
      confidence: 0.93,
      pattern_types: ['peeling_chain', 'anomaly'],
      created_at: '2026-09-06T00:00:00Z',
    },
    {
      alert_id: 'b2c1a0d3-1234-4f7b-8c3a-2e1d4f7b8c3b',
      entity_type: 'transaction',
      entity_id: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      risk_score: 78.2,
      risk_level: 'HIGH',
      confidence: 0.81,
      pattern_types: ['coinjoin'],
      created_at: '2026-09-06T01:12:00Z',
    },
    {
      alert_id: 'c3d2b1e4-5678-4f7b-8c3a-2e1d4f7b8c3c',
      entity_type: 'wallet',
      entity_id: '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu',
      risk_score: 58.0,
      risk_level: 'MEDIUM',
      confidence: 0.67,
      pattern_types: ['fan_out'],
      created_at: '2026-09-06T02:40:00Z',
    },
    {
      alert_id: 'd4e3c2f5-9012-4f7b-8c3a-2e1d4f7b8c3d',
      entity_type: 'wallet',
      entity_id: '1CounterpartyXampleAddr000000001',
      risk_score: 31.0,
      risk_level: 'LOW',
      confidence: 0.52,
      pattern_types: ['fan_in'],
      created_at: '2026-09-06T03:05:00Z',
    },
  ],
};

export const mockEvidence: AlertEvidence = {
  alert_id: '8f3b6c2a-9e1d-4f7b-8c3a-2e1d4f7b8c3a',
  evidence: [
    {
      evidence_type: 'anomaly_score',
      description: 'Anomaly score 0.89 (Isolation Forest) — top features: tx_frequency, country_count, fan_out',
      weight: 0.3,
      data: {
        score: 0.89,
        top_features: [
          { feature: 'tx_frequency', z_score: 4.2 },
          { feature: 'country_count', z_score: 3.8 },
          { feature: 'fan_out', z_score: 3.1 },
        ],
      },
    },
    {
      evidence_type: 'peeling_chain',
      description: 'Involved in 2 peeling chains, avg length 7 hops, avg peel fraction 8%',
      weight: 0.25,
      data: {
        chain_count: 2,
        avg_chain_length: 7,
        avg_peel_fraction: 0.08,
        txids: ['4a5e1e...', 'def678...'],
      },
    },
    {
      evidence_type: 'risk_propagation',
      description: '2-hop connection to high-risk seed wallet',
      weight: 0.1,
      data: {
        seed_wallet: '1SeedXXX...',
        hop_distance: 2,
        propagated_score: 0.8,
        path: ['1SeedXXX...', 'txid_abc', '1A1zP1...'],
      },
    },
  ],
};

export const mockGraph: GraphData = {
  nodes: [
    {
      id: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      type: 'wallet',
      label: '1A1zP1...vfNa',
      data: { risk_score: 91.5, risk_level: 'CRITICAL', tx_count: 42 },
    },
    {
      id: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      type: 'transaction',
      label: '4a5e1e...a33b',
      data: { timestamp: '2026-01-15T12:34:56Z', amount: 1.234, fee: 0.004 },
    },
    {
      id: '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu',
      type: 'wallet',
      label: '1BpEi6...Vggu',
      data: { risk_score: 58.0, risk_level: 'MEDIUM', tx_count: 9 },
    },
  ],
  edges: [
    {
      id: 'e_001',
      source: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      target: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      type: 'INPUT_TO',
      data: { amount: 0.5, timestamp: '2026-01-15T12:34:56Z' },
    },
    {
      id: 'e_002',
      source: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      target: '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu',
      type: 'OUTPUT_FROM',
      data: { amount: 0.48, timestamp: '2026-01-15T12:35:10Z' },
    },
  ],
};

export const mockPropagation: AlertPropagation = {
  alert_id: '8f3b6c2a-9e1d-4f7b-8c3a-2e1d4f7b8c3a',
  target_wallet: '1A1zP1...',
  propagation_path: {
    seed_wallet: '1SeedXXX...',
    seed_score: 1.0,
    hops: [
      { hop: 1, wallet: '1BpEi6...', txid: 'abc12345...', score: 0.8 },
      { hop: 2, wallet: '1A1zP1...', txid: 'def67890...', score: 0.64 },
    ],
  },
};

export const mockWalletRisk: WalletRisk = {
  address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  risk_score: 91.5,
  risk_level: 'CRITICAL',
  confidence: 0.93,
  components: {
    anomaly: 0.89,
    peeling: 0.72,
    coinjoin: 0.1,
    cluster: 1.0,
    network: 0.45,
    propagated: 0.8,
  },
  weights: {
    anomaly: 0.3,
    peeling: 0.25,
    coinjoin: 0.15,
    cluster: 0.1,
    network: 0.1,
    propagated: 0.1,
  },
};
