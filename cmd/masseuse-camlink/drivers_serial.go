package main

import (
	"flag"
	"path/filepath"

	"github.com/FemLed/masseuse-camlink/internal/estim"
	"github.com/FemLed/masseuse-camlink/internal/estim/mk312"
)

// The USB serial family (the MK-312BT), registered from this file alone
// with its flag and its key store, so a build without it drops the file.

var estimPort = flag.String("estim-port", envOr("MASSEUSE_CAMLINK_ESTIM_PORT", ""),
	`the serial port of the stimulation device, if the scan picks the wrong one; "off" to leave serial ports alone (default: scan the USB serial adapters)`)

func init() {
	families = append(families, deviceFamily{
		name: "MK-312BT (USB serial)",
		finder: func(cfg finderConfig) estim.Finder {
			if familyOff(*estimPort) {
				return nil
			}
			store := mk312.FileKeyStore{Path: filepath.Join(cfg.stateDir, "mk312-key")}
			return mk312.NewFinder(*estimPort, store, cfg.log)
		},
	})
}
