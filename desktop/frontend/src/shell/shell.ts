// The window around the page: the Wails runtime when the page runs inside
// the desktop shell (main.go), a browser otherwise (the mock-ups). The
// shell's own methods (bindings) open links and quit; the connector's data
// comes through the bridge (src/bridge) either way.

import { Clipboard, Events, System } from '@wailsio/runtime';

import { ConnectorService } from '../../bindings/github.com/FemLed/masseuse-camlink/desktop';
import type { Platform } from '../bridge/store';

/** Whether the page is inside the desktop shell rather than a browser. */
export function inWails(): boolean {
    return System.IsDesktop();
}

/** The platform the shell runs on, when inside it. */
export function hostPlatform(): Platform | null {
    if (System.IsMac()) return 'darwin';
    if (System.IsWindows()) return 'windows';
    if (System.IsLinux()) return 'linux';
    return null;
}

/** The pages the Help menu and About open, by name; the shell holds the same list (connector.go). */
export const LINKS = {
    'learn-more': 'https://masseuse.ai/app',
    privacy: 'https://github.com/FemLed/masseuse-camlink#how-it-stays-private',
    verify: 'https://github.com/FemLed/masseuse-camlink/blob/main/VERIFY.md',
    security: 'https://github.com/FemLed/masseuse-camlink/blob/main/SECURITY.md',
    source: 'https://github.com/FemLed/masseuse-camlink',
    releases: 'https://github.com/FemLed/masseuse-camlink/releases',
} as const;

export type LinkName = keyof typeof LINKS;

/** Opens one of the known pages in the default browser. */
export async function openLink(name: LinkName): Promise<void> {
    if (inWails()) {
        await ConnectorService.OpenLink(name);
    } else {
        window.open(LINKS[name], '_blank', 'noopener');
    }
}

export async function revealStateDir(): Promise<void> {
    if (inWails()) await ConnectorService.RevealStateDir();
}

/** Ends the program; the camera goes off and the unit is released on the way out. */
export async function quit(): Promise<void> {
    if (inWails()) await ConnectorService.Quit();
}

/** Puts text on the clipboard: the shell's clipboard inside the window, the browser's outside. */
export async function copyText(text: string): Promise<boolean> {
    try {
        if (inWails()) {
            await Clipboard.SetText(text);
        } else {
            await navigator.clipboard.writeText(text);
        }
        return true;
    } catch {
        return false;
    }
}

/** Starts the connector again after it stopped; in a browser the page starts over. */
export async function restartConnector(): Promise<void> {
    if (inWails()) {
        await ConnectorService.Restart();
    } else {
        window.location.reload();
    }
}

/** Reveals the connector's log (the shell keeps it under the state directory). */
export async function showLog(): Promise<void> {
    if (inWails()) await ConnectorService.ShowLog();
}

export type MenuAction = 'about' | 'check-updates';

/** Listens for the native menu's requests (main.go emits them as "menu" events). */
export function onMenu(handler: (action: MenuAction) => void): () => void {
    if (!inWails()) return () => {};
    return Events.On('menu', (ev) => {
        const action = ev.data;
        if (action === 'about' || action === 'check-updates') handler(action);
    });
}
