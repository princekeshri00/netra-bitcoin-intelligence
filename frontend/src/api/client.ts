import type {
  Paginated,
  Dataset,
  AlertSummary,
  AlertEvidence,
  AlertPropagation,
  GraphData,
  WalletRisk,
  AnalysisJob,
  AnalysisStats,
  TransactionListItem,
  TransactionDetail,
  WalletListItem,
  StreamTransaction,
  ClusterInfo,
} from '../types';

import {
  mockDataset,
  mockJobPending,
  mockJobDone,
  mockAnalysisStats,
  mockAlertsPage,
  mockEvidence,
  mockGraph,
  mockPropagation,
  mockWalletRisk,
} from '../data/mockData';

// USE_MOCK stays the master switch.
// Set VITE_USE_MOCK=false in .env.local when the real backend is available.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const API_BASE =
  import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api/v1';

const DATASET_ID =
  import.meta.env.VITE_DATASET_ID ?? 'demo_01';

const TIMEOUT_MS = 6000;

// --------------------------------------------------
// Generic HTTP helpers
// --------------------------------------------------

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;

      try {
        const body = await res.json();
        message = body.message ?? message;
      } catch {
        // Response was not JSON.
      }

      throw new Error(`${path} → ${message}`);
    }

    return res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `Timed out waiting ${TIMEOUT_MS}ms for ${path}. ` +
        `Check: is uvicorn running on ${API_BASE}? ` +
        `Is CORS enabled for this origin? ` +
        `Is DATASET_ID "${DATASET_ID}" correct?`
      );
    }

    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`${path} → ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

// --------------------------------------------------
// Datasets
// --------------------------------------------------

export async function fetchDataset(): Promise<Dataset> {
  if (USE_MOCK) {
    return delay(mockDataset);
  }

  return request<Dataset>(`/datasets/${DATASET_ID}/`);
}

export async function fetchDatasetDetail(
  datasetId: string
): Promise<Dataset> {
  if (USE_MOCK) {
    return delay({
      ...mockDataset,
      dataset_id: datasetId,
    });
  }

  return request<Dataset>(`/datasets/${datasetId}/`);
}

export async function importDataset(
  file: File,
  datasetId = DATASET_ID
): Promise<AnalysisJob> {
  if (USE_MOCK) {
    return delay({
      ...mockJobPending,
      dataset_id: datasetId,
    });
  }

  const formData = new FormData();

  formData.append('file', file);
  formData.append('dataset_id', datasetId);

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/datasets/import/`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(
        `/datasets/import/ → ${res.status} ${res.statusText}`
      );
    }

    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

// --------------------------------------------------
// Analysis pipeline
// --------------------------------------------------

const JOB_STORAGE_KEY = `netra_job_${DATASET_ID}`;

export function getStoredJobId(): string | null {
  return localStorage.getItem(JOB_STORAGE_KEY);
}

export async function triggerAnalysis(
  datasetId = DATASET_ID
): Promise<AnalysisJob> {
  if (USE_MOCK) {
    return delay({
      ...mockJobPending,
      dataset_id: datasetId,
    });
  }

  const job = await post<AnalysisJob>(
    '/analysis/',
    {
      dataset_id: datasetId,
    }
  );

  localStorage.setItem(
    `netra_job_${datasetId}`,
    job.job_id
  );

  return job;
}

export async function fetchJobStatus(
  jobId: string
): Promise<AnalysisJob> {
  if (USE_MOCK) {
    return delay(mockJobDone);
  }

  return request<AnalysisJob>(
    `/analysis/${jobId}/`
  );
}

export async function fetchAnalysisStats(
  jobId: string
): Promise<AnalysisStats> {
  if (USE_MOCK) {
    return delay(mockAnalysisStats);
  }

  return request<AnalysisStats>(
    `/analysis/${jobId}/stats/`
  );
}

// --------------------------------------------------
// Alerts
// --------------------------------------------------

export async function fetchAlerts(
  params: {
    risk_level?: string;
    pattern_type?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Paginated<AlertSummary>> {
  if (USE_MOCK) {
    return delay(mockAlertsPage);
  }

  const queryParams = new URLSearchParams();

  queryParams.set('dataset_id', DATASET_ID);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.set(key, String(value));
    }
  });

  const qs = queryParams.toString();

  return request<Paginated<AlertSummary>>(
    `/alerts/?${qs}`
  );
}

export async function fetchAlertDetail(
  alertId: string
): Promise<AlertSummary> {
  if (USE_MOCK) {
    const alert =
      mockAlertsPage.results.find(
        (a) => a.alert_id === alertId
      ) ?? mockAlertsPage.results[0];

    return delay(alert);
  }

  return request<AlertSummary>(
    `/alerts/${alertId}/`
  );
}

export async function fetchAlertEvidence(
  alertId: string
): Promise<AlertEvidence> {
  if (USE_MOCK) {
    return delay({
      ...mockEvidence,
      alert_id: alertId,
    });
  }

  return request<AlertEvidence>(
    `/alerts/${alertId}/evidence/`
  );
}

export async function fetchAlertGraph(
  alertId: string
): Promise<GraphData> {
  if (USE_MOCK) {
    void alertId;
    return delay(mockGraph);
  }

  return request<GraphData>(
    `/alerts/${alertId}/graph/`
  );
}

export async function fetchAlertPropagation(
  alertId: string
): Promise<AlertPropagation> {
  if (USE_MOCK) {
    return delay({
      ...mockPropagation,
      alert_id: alertId,
    });
  }

  return request<AlertPropagation>(
    `/alerts/${alertId}/propagation/`
  );
}

// --------------------------------------------------
// Transactions
// --------------------------------------------------

const mockTransactions: TransactionListItem[] = [
  {
    txid:
      '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    timestamp: '2026-01-15T12:34:56Z',
    block_height: 100000,
    total_input_amount: 1.234,
    total_output_amount: 1.23,
    fee: 0.004,
    input_count: 1,
    output_count: 1,
    is_coinbase: false,
    script_type: 'P2PKH',
    src_ip: '192.168.1.10',
  },
];

export async function fetchTransactions(
  params: {
    address?: string;
    src_ip?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Paginated<TransactionListItem>> {
  if (USE_MOCK) {
    let results = [...mockTransactions];

    if (params.address) {
      results = results.filter((tx) =>
        tx.txid
          .toLowerCase()
          .includes(params.address!.toLowerCase())
      );
    }

    if (params.src_ip) {
      results = results.filter((tx) =>
        tx.src_ip.includes(params.src_ip!)
      );
    }

    return delay({
      count: results.length,
      next: null,
      previous: null,
      results,
    });
  }

  const queryParams = new URLSearchParams();

  queryParams.set('dataset_id', DATASET_ID);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.set(key, String(value));
    }
  });

  return request<Paginated<TransactionListItem>>(
    `/transactions/?${queryParams.toString()}`
  );
}

export async function fetchTransactionDetail(
  txid: string
): Promise<TransactionDetail> {
  if (USE_MOCK) {
    const tx =
      mockTransactions.find(
        (item) => item.txid === txid
      ) ?? mockTransactions[0];

    return delay({
      ...tx,
      block_hash: 'mock-block-hash',
      transaction_index: 0,
      version: 1,
      locktime: 0,
      transaction_size: 250,
      transaction_weight: 1000,
      src_port: 8333,
      dst_ip: '192.168.1.20',
      dst_port: 8333,
    });
  }

  return request<TransactionDetail>(
    `/transactions/${txid}/`
  );
}

// --------------------------------------------------
// Wallets
// --------------------------------------------------

const mockWallets: WalletListItem[] = [
  {
    address: mockWalletRisk.address,
    first_seen: '2026-01-01T00:00:00Z',
    last_seen: '2026-09-06T00:00:00Z',
    tx_count: 42,
    total_received: 125.5,
    total_sent: 118.2,
    risk_score: mockWalletRisk.risk_score,
    risk_level: mockWalletRisk.risk_level,
  },
];

export async function fetchWallets(
  params: {
    q?: string;
    risk_level?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Paginated<WalletListItem>> {
  if (USE_MOCK) {
    let results = [...mockWallets];

    if (params.q) {
      results = results.filter((wallet) =>
        wallet.address
          .toLowerCase()
          .includes(params.q!.toLowerCase())
      );
    }

    if (params.risk_level) {
      results = results.filter(
        (wallet) =>
          wallet.risk_level === params.risk_level
      );
    }

    return delay({
      count: results.length,
      next: null,
      previous: null,
      results,
    });
  }

  const queryParams = new URLSearchParams();

  queryParams.set('dataset_id', DATASET_ID);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.set(key, String(value));
    }
  });

  return request<Paginated<WalletListItem>>(
    `/wallets/?${queryParams.toString()}`
  );
}

export async function fetchWalletRisk(
  address: string
): Promise<WalletRisk> {
  if (USE_MOCK) {
    void address;
    return delay(mockWalletRisk);
  }

  return request<WalletRisk>(
    `/wallets/${address}/risk/`
  );
}

// --------------------------------------------------
// Graph Explorer
// --------------------------------------------------

export async function fetchGraphNeighborhood(
  alertId: string,
  depth = 2
): Promise<GraphData> {
  if (USE_MOCK) {
    void alertId;
    void depth;

    return delay(mockGraph);
  }

  const queryParams = new URLSearchParams({
    alert_id: alertId,
    depth: String(depth),
  });

  return request<GraphData>(
    `/graph/neighborhood/?${queryParams.toString()}`
  );
}

// --------------------------------------------------
// Clusters
// --------------------------------------------------

export async function fetchClusters(): Promise<ClusterInfo[]> {
  if (USE_MOCK) {
    return delay([]);
  }

  return request<ClusterInfo[]>(
    `/clusters/?dataset_id=${DATASET_ID}`
  );
}

// --------------------------------------------------
// Live Stream
// --------------------------------------------------

export async function fetchStreamSample(): Promise<
  StreamTransaction[]
> {
  if (USE_MOCK) {
    return delay([
      {
        txid: 'tx-stream-001',
        sender: 'bc1q...sender',
        receiver: 'bc1q...receiver',
        amount: 1.42,
        timestamp: new Date().toISOString(),
        ip: '185.12.44.21',
        country: 'US',
        isAnomalous: false,
        anomalyScore: 12,
      },
      {
        txid: 'tx-stream-002',
        sender: 'bc1q...sender2',
        receiver: 'bc1q...receiver2',
        amount: 8.75,
        timestamp: new Date().toISOString(),
        ip: '91.201.44.8',
        country: 'RU',
        isAnomalous: true,
        anomalyScore: 91,
      },
    ]);
  }

  return request<StreamTransaction[]>(
    `/stream/sample/?dataset_id=${DATASET_ID}`
  );
}