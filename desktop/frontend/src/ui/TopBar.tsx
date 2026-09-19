// The window's top bar: the wordmark, and how the connector stands with
// masseuse.ai. On macOS the native title bar is hidden and this bar is
// where the traffic lights sit (main.go, MacTitleBarHiddenInset), so it
// insets for them and drags the window; on Windows and Linux the native
// title bar and menu bar are above it.

import { useAppState } from '../bridge/store';
import { Wordmark } from '../brand/Wordmark';
import { StatusChip, type Tone } from './StatusChip';

function serviceStatus(online: boolean | null): { tone: Tone; text: string } {
    if (online === null) return { tone: 'busy', text: 'Reaching masseuse.ai…' };
    if (online) return { tone: 'live', text: 'Connected to masseuse.ai' };
    return { tone: 'warn', text: 'Reconnecting to masseuse.ai…' };
}

export function TopBar() {
    const { platform, online, blocked } = useAppState();
    const status = serviceStatus(online);
    const mac = platform === 'darwin';
    return (
        <header className={`drag-region flex h-[52px] shrink-0 items-center justify-between pr-4 ${mac ? 'pl-[86px]' : 'pl-6'}`}>
            <Wordmark className="w-[126px] text-bone" />
            <div className="no-drag flex items-center gap-2">
                {blocked ? null : (
                    <StatusChip tone={status.tone}>{status.text}</StatusChip>
                )}
            </div>
        </header>
    );
}
