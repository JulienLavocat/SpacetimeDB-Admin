import { Subject } from "rxjs";
import { LogLine } from "./types";

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
    console.log("PUMPING");
    while (!subject.closed) {
      console.log("feetching data");
      await fetch(url, {
        headers: { Authorization: "Bearer " + token },
        signal: cancellation.signal,
      }).then((r) => readLogsFromResponse(r, subject));
    }
    console.log("WE OUT BABYYYYY");
  };

  return [subject, pump, cancel];
}

async function readLogsFromResponse(r: Response, subject: Subject<LogLine[]>) {
  const reader = r.body?.getReader();
  if (reader == null) return;
  console.log("entering reader");

  while (true) {
    console.log("waiting for data");
    const { value, done } = await reader.read();

    if (done) {
      console.log("read complete", done);
      break;
    }

    console.log("data received, parsing");
    parseLogsChunk(value, subject);
  }
}

function parseLogsChunk(chunk: Uint8Array, subject: Subject<LogLine[]>) {
  const lines: LogLine[] = [];
  new TextDecoder()
    .decode(chunk)
    .split("\n")
    .map((element) => {
      if (element) {
        const line = JSON.parse(element);
        line.ts = new Date(line.ts / 1000);
        line.level = line.level.toLowerCase();
        lines.push(line);
      }
    });
  subject.next(lines);
}
