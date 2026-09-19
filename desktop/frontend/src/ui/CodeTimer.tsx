// How much longer the code is good for, as the ring an authenticator app
// draws: full when the code is new, emptying clockwise over the code's
// life, ember for the last stretch. It says nothing in words; the service
// sends the next code when this one lapses.

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

/** The last stretch of a code's life, when the ring and the code turn ember. */
export const CODE_ENDING_MS = 60_000;

export interface Countdown {
    /** 0 to 1 of the code's life left. */
    fraction: number;
    remainingMs: number;
    /** In the last stretch: time to look at the phone. */
    ending: boolean;
    /** Past its end: the next code is due. */
    expired: boolean;
}

/** The code's remaining life, recomputed every second. */
export function useCountdown(expiresAt: number | undefined, ttlMs: number | undefined): Countdown | null {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!expiresAt) return;
        setNow(Date.now());
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [expiresAt]);
    if (!expiresAt || !ttlMs) return null;
    const remainingMs = Math.max(0, expiresAt - now);
    return {
        fraction: Math.max(0, Math.min(1, remainingMs / ttlMs)),
        remainingMs,
        ending: remainingMs > 0 && remainingMs <= CODE_ENDING_MS,
        expired: remainingMs <= 0,
    };
}

interface Props {
    countdown: Countdown | null;
    size?: number;
    className?: string;
}

export function CodeTimer({ countdown, size = 32, className }: Props) {
    const stroke = 3.5;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const fraction = countdown?.fraction ?? 0;
    const ending = countdown?.ending ?? false;
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={countdown ? (countdown.expired ? 'The code has expired; a new one is coming' : `${Math.ceil(countdown.remainingMs / 60_000)} minutes left on this code`) : 'No code yet'}
            className={cn('shrink-0 -rotate-90', className)}
        >
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/12" />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - fraction)}
                className={cn('transition-[stroke-dashoffset,color] duration-1000 ease-linear', ending ? 'text-ember animate-pulse-soft' : 'text-rose')}
            />
        </svg>
    );
}
