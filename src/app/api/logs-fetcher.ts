import { Subject } from "rxjs";
import { LogLine } from "./types";

export class LogsAccessError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "LogsAccessError";
  }
}

export function streamLogs(
  instanceUrl: string,
  database: string,
  token: string,
): [Subject<LogLine[]>, () => void, () => void] {
  const url = `${instanceUrl}/v1/database/${database}/logs?follow=true&num_lines=1000`;
  const subject = new Subject<LogLine[]>();
  const cancellation = new AbortController();

  const cancel = () => {
    cancellation.abort();
    subject.complete();
  };

  const pump = async () => {
    while (!subject.closed) {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = "Bearer " + token;
        }

        const response = await fetch(url, {
          headers,
          signal: cancellation.signal,
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          subject.error(
            new LogsAccessError(
              body || response.statusText || `HTTP ${response.status}`,
              response.status,
            ),
          );
          return;
        }

        await readLogsFromResponse(response, subject);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        subject.error(e);
        return;
      }
    }
  };

  return [subject, pump, cancel];
}

async function readLogsFromResponse(r: Response, subject: Subject<LogLine[]>) {
  const reader = r.body?.getReader();
  if (reader == null) return;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    parseLogsChunk(value, subject);
  }
}

function parseLogsChunk(chunk: Uint8Array, subject: Subject<LogLine[]>) {
  const lines: LogLine[] = [];
  new TextDecoder()
    .decode(chunk)
    .split("\n")
    .forEach((element) => {
      if (element) {
        try {
          const line = JSON.parse(element);
          line.ts = new Date(line.ts / 1000);
          line.level = line.level.toLowerCase();
          lines.push(line);
        } catch {
          // ignore partial/invalid lines
        }
      }
    });
  if (lines.length) subject.next(lines);
}
