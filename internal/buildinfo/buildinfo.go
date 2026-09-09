// Package buildinfo reports the module version stamped into the binary.
//
// There is deliberately no -X ldflag: a release built by goreleaser from the
// module proxy and a binary produced by `go install
// github.com/FemLed/masseuse-camlink/cmd/...@vX.Y.Z` both carry the tag in
// their embedded module information, so they report the same version and,
// with the same toolchain and flags, are byte-for-byte identical
// (VERIFY.md).
package buildinfo

import "runtime/debug"

// Version is the module version the binary was built from ("v0.1.0"), or
// "(devel)" for a build from a working tree.
func Version() string {
	info, ok := debug.ReadBuildInfo()
	if !ok || info.Main.Version == "" {
		return "(devel)"
	}
	return info.Main.Version
}

// GoVersion is the toolchain that compiled the binary.
func GoVersion() string {
	info, ok := debug.ReadBuildInfo()
	if !ok {
		return "unknown"
	}
	return info.GoVersion
}
