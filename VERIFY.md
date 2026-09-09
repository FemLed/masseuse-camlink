# Verifying a release

Every release on the [releases page](https://github.com/FemLed/masseuse-camlink/releases)
carries:

- `checksums.txt`: SHA-256 of every archive and of the raw gateway binaries;
- `checksums.txt.sigstore.json`: a cosign keyless signature bundle over the
  checksum file, signed by this repository's release workflow;
- `multiple.intoto.jsonl`: SLSA v1 provenance for every artifact, produced by
  the SLSA generic generator in a separate, isolated job;
- container images at `ghcr.io/femled/masseuse-camlink`, signed keyless by
  digest, with SBOMs and their own SLSA container provenance.

`scripts/verify-release.sh vX.Y.Z` runs all of the checks below.

## 1. Signature

```sh
cosign verify-blob \
  --bundle checksums.txt.sigstore.json \
  --certificate-identity-regexp '^https://github.com/FemLed/masseuse-camlink/\.github/workflows/release\.yml@refs/tags/v' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  checksums.txt
sha256sum -c checksums.txt --ignore-missing
```

## 2. Provenance

```sh
slsa-verifier verify-artifact masseuse-camlink_X.Y.Z_linux_amd64.tar.gz \
  --provenance-path multiple.intoto.jsonl \
  --source-uri github.com/FemLed/masseuse-camlink \
  --source-tag vX.Y.Z
```

For the image:

```sh
cosign verify ghcr.io/femled/masseuse-camlink@sha256:... \
  --certificate-identity-regexp '^https://github.com/FemLed/masseuse-camlink/\.github/workflows/release\.yml@refs/tags/v' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
slsa-verifier verify-image ghcr.io/femled/masseuse-camlink@sha256:... \
  --source-uri github.com/FemLed/masseuse-camlink --source-tag vX.Y.Z
```

## 3. Reproduce the binaries

Releases are built from the Go module proxy (not from a checkout), with
`GOTOOLCHAIN=go1.27.1`, `CGO_ENABLED=0`, `-trimpath -buildvcs=false` and
`-ldflags='-s -w -buildid='`. There is no `-X` version flag: the version is
the module version Go embeds, which is the same for a proxy build and for
`go install ...@vX.Y.Z`. Rebuilding therefore takes one command per binary:

```sh
export GOTOOLCHAIN=go1.27.1 CGO_ENABLED=0 GOFLAGS=-trimpath
GOOS=linux GOARCH=amd64 go install -buildvcs=false -ldflags='-s -w -buildid=' \
  github.com/FemLed/masseuse-camlink/cmd/masseuse-camlink-gateway@vX.Y.Z
sha256sum "$(go env GOPATH)/bin/linux_amd64/masseuse-camlink-gateway"
grep masseuse-camlink-gateway_X.Y.Z_linux_amd64 checksums.txt
```

The two hashes match. (On a Linux amd64 host the binary lands in
`$(go env GOPATH)/bin/` without the `linux_amd64` subdirectory.) The release
workflow's `reproduce` job performs exactly this comparison for the gateway
on every tag and fails the release if the hashes differ.

The video enclave image (`masseuse-video-tee`, a separate repository) installs
the gateway with the same command and checks the resulting binary against the
release checksum before it is allowed into the image.

## 4. What the version string tells you

`masseuse-camlink --version` prints the module version and the Go toolchain
from the binary's embedded build information, e.g. `v0.1.0 go1.27.1`. A build
from a working tree prints `(devel)`.
