// Where the page starts. Inside the desktop shell the connector behind the
// window is the real one, through the shell (src/bridge/wails); in a
// browser it is the mock (src/bridge/mock), the scenario picked from the
// URL or the scenario panel, and `?mock=1` asks for the mock inside the
// shell too, for demonstrations. Inside the shell the page asks it who it
// is (version, state directory) and listens for the native menu.

import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ConnectorService } from '../bindings/github.com/FemLed/masseuse-camlink/desktop';
import { App } from './App';
import { MockBridge } from './bridge/mock/MockBridge';
import { DEFAULT_SCENARIO, findScenario, scenarioState } from './bridge/mock/scenarios';
import { initialState, StoreProvider, useDispatch, type Platform } from './bridge/store';
import type { Bridge } from './bridge/types';
import { WailsBridge } from './bridge/wails/WailsBridge';
import { MenuReference } from './dev/MenuReference';
import { ScenarioPanel } from './dev/ScenarioPanel';
import { WindowFrame } from './dev/WindowFrame';
import { hostPlatform, inWails } from './shell/shell';
import './index.css';

const DEV = import.meta.env.DEV;

function readParams() {
    const p = new URLSearchParams(window.location.search);
    const os = p.get('os');
    return {
        scenario: p.get('scenario') ?? DEFAULT_SCENARIO,
        os: os === 'darwin' || os === 'windows' || os === 'linux' ? (os as Platform) : null,
        menu: p.get('page') === 'menu',
        // `panel=0` hides the scenario pill, for clean screenshots.
        panel: p.get('panel') !== '0',
        // `mock=1` runs the page on the mock inside the shell.
        mock: p.get('mock') === '1',
    };
}

function writeParams(next: { scenario: string; os: Platform | null; menu: boolean; panel: boolean; mock: boolean }) {
    const p = new URLSearchParams();
    p.set('scenario', next.scenario);
    if (next.os) p.set('os', next.os);
    if (next.menu) p.set('page', 'menu');
    if (!next.panel) p.set('panel', '0');
    if (next.mock) p.set('mock', '1');
    window.history.replaceState(null, '', `?${p.toString()}`);
}

/** Inside the shell: what the window knows about itself, into the store. */
function ShellInfo() {
    const dispatch = useDispatch();
    useEffect(() => {
        if (!inWails()) return;
        ConnectorService.Info()
            .then((info) => dispatch({ type: 'ui/shell', shell: { version: info.version, wired: info.wired, stateDir: info.stateDir } }))
            .catch(() => {});
    }, [dispatch]);
    return null;
}

function Root() {
    const [params, setParams] = useState(readParams);
    const scenario = useMemo(() => findScenario(params.scenario), [params.scenario]);
    const platform: Platform = hostPlatform() ?? params.os ?? scenario.platform ?? 'darwin';
    // The real connector inside the shell, the mock elsewhere (or on request).
    const mock = !inWails() || params.mock;
    const bridge = useMemo<Bridge>(() => (mock ? new MockBridge(scenario) : new WailsBridge()), [mock, scenario]);
    const initial = useMemo(() => (mock ? scenarioState(scenario, initialState, platform) : { ...initialState, platform }), [mock, scenario, platform]);

    useEffect(() => {
        if (DEV) writeParams(params);
    }, [params]);

    const content = (
        <StoreProvider bridge={bridge} initial={initial}>
            <ShellInfo />
            {DEV && params.menu ? <MenuReference platform={platform} onClose={() => setParams((p) => ({ ...p, menu: false }))} /> : <App />}
            {DEV && params.panel && mock ? (
                <ScenarioPanel
                    current={scenario}
                    platform={platform}
                    onPick={(id) => setParams((p) => ({ ...p, scenario: id, menu: false }))}
                    onPlatform={(os) => setParams((p) => ({ ...p, os }))}
                    onMenuReference={() => setParams((p) => ({ ...p, menu: !p.menu }))}
                />
            ) : null}
        </StoreProvider>
    );

    // A browser gets a window drawn around the page; the shell is the window.
    return inWails() ? <div className="h-full">{content}</div> : <WindowFrame platform={platform}>{content}</WindowFrame>;
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Root />
    </StrictMode>,
);
