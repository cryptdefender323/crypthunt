export type TimerHandle = ReturnType<typeof setTimeout> | number;
export interface SpawnDeps {
    spawn?: typeof Bun.spawn;
    setTimer: (fn: () => void, ms: number) => TimerHandle;
    clearTimer: (handle: TimerHandle) => void;
}
export interface MonitoredProcess {
    kill(signal?: NodeJS.Signals): void;
    exited: Promise<{
        code: number | null;
        signal: string | null;
    }>;
    stdout: ReadableStream<Uint8Array>;
    stderr: ReadableStream<Uint8Array>;
}
export declare function spawnMonitoredProcess(opts: {
    command: string;
    cwd?: string;
    env?: Record<string, string>;
    maxRuntimeMs: number;
}, deps: SpawnDeps): MonitoredProcess;
