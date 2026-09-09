// masseuse-camlink runs at home, next to the camera, and relays its
// encrypted stream to the one attested enclave a session names
// (docs/PROTOCOL.md).
package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/FemLed/masseuse-camlink/internal/buildinfo"
)

func main() {
	version := flag.Bool("version", false, "print the version and exit")
	flag.Parse()
	if *version {
		fmt.Println(buildinfo.Version(), buildinfo.GoVersion())
		return
	}
	fmt.Fprintln(os.Stderr, "masseuse-camlink: not implemented yet")
	os.Exit(2)
}
