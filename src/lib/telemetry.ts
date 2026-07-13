export interface ExecutionTraceEvent {
  id: string;
  timestamp: string;
  stage:
    | "ZIP_SELECT"
    | "ZIP_EXTRACT_COMPLETED"
    | "REACT_STATE_UPDATE"
    | "INDEXEDDB_WRITE"
    | "INDEXEDDB_READ"
    | "API_UPLOAD_START"
    | "API_UPLOAD_CHUNK_SUCCESS"
    | "API_UPLOAD_CHUNK_FAILED"
    | "API_SYNC_READ"
    | "API_SYNC_WRITE"
    | "API_IMAGE_FETCH_START"
    | "API_IMAGE_FETCH_SUCCESS"
    | "API_IMAGE_FETCH_FAILED"
    | "THUMBNAIL_RENDER";
  count: number;
  successCount: number;
  failedCount: number;
  durationMs: number;
  dataSizeBytes?: number;
  status: "SUCCESS" | "FAILED" | "PENDING" | "INFO";
  message: string;
  details?: Record<string, unknown>;
}

export interface TelemetryMetrics {
  zipExtractedCount: number;
  reactStateImageCount: number;
  indexedDbImageCount: number;
  uploadRequestCount: number;
  uploadSuccessCount: number;
  uploadFailCount: number;
  uploadPendingCount: number;
  downloadRequestCount: number;
  downloadSuccessCount: number;
  downloadFailCount: number;
  downloadPendingCount: number;
  renderedThumbnailCount: number;
  cloudSyncStatus: "SYNCED" | "SYNCING" | "ERROR" | "IDLE";
  cloudVersion: number;
}

type TelemetryListener = () => void;

class TelemetryService {
  private traces: ExecutionTraceEvent[] = [];
  private metrics: TelemetryMetrics = {
    zipExtractedCount: 0,
    reactStateImageCount: 0,
    indexedDbImageCount: 0,
    uploadRequestCount: 0,
    uploadSuccessCount: 0,
    uploadFailCount: 0,
    uploadPendingCount: 0,
    downloadRequestCount: 0,
    downloadSuccessCount: 0,
    downloadFailCount: 0,
    downloadPendingCount: 0,
    renderedThumbnailCount: 0,
    cloudSyncStatus: "IDLE",
    cloudVersion: 0,
  };

  private listeners: Set<TelemetryListener> = new Set();

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public logTrace(event: Omit<ExecutionTraceEvent, "id" | "timestamp">) {
    const newEvent: ExecutionTraceEvent = {
      ...event,
      id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.traces = [newEvent, ...this.traces].slice(0, 500);
    this.notify();
  }

  public updateMetrics(partial: Partial<TelemetryMetrics>) {
    this.metrics = { ...this.metrics, ...partial };
    this.notify();
  }

  public incrementMetric(key: keyof TelemetryMetrics, delta = 1) {
    const current = this.metrics[key];
    if (typeof current === "number") {
      this.metrics = {
        ...this.metrics,
        [key]: Math.max(0, current + delta),
      };
      this.notify();
    }
  }

  public getTraces(): ExecutionTraceEvent[] {
    return this.traces;
  }

  public getMetrics(): TelemetryMetrics {
    return this.metrics;
  }

  public clearTraces() {
    this.traces = [];
    this.notify();
  }
}

export const telemetry = new TelemetryService();
