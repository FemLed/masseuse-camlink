// Why the person is here, in two lines under a screen's heading: the tagline
// in the brand's voice (index.css, --font-brand, the serif italic), and the
// differentiator as figures, the numbers in rose with their words small
// beside them, read aloud as the sentence they stand for. Pair shows it
// under "Type this code into your phone" (the reason to pair at all) and
// Cameras under its heading; the copy lives here alone.

import { cn } from '@/lib/utils';

export const TAGLINE = 'See how your full body responds to electrostimulation.';

/** The differentiator as a sentence, for assistive tech and the docs. */
export const PUNCHLINE = 'Over 300 data points analyzed 10 times a second.';

export function Punchline({ className }: { className?: string }) {
    return (
        <div className={className}>
            <p className="font-brand text-[19px] leading-snug text-bone italic">{TAGLINE}</p>
            <p className="mt-2">
                <span className="sr-only">{PUNCHLINE}</span>
                <span aria-hidden className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <Figure value="300+" label="data points" />
                    <span className="text-[12px] leading-none text-bone-dim">analyzed</span>
                    <Figure value="10×" label="a second" />
                </span>
            </p>
        </div>
    );
}

/** One figure: the number in rose, as the steps' numerals are, its words small beside it. */
export function Figure({ value, label, className }: { value: string; label: string; className?: string }) {
    return (
        <span className={cn('inline-flex items-baseline gap-1.5', className)}>
            <span className="text-[26px] leading-none font-semibold tracking-tight text-rose tabular-nums">{value}</span>
            <span className="text-[12px] leading-none text-bone-dim">{label}</span>
        </span>
    );
}
