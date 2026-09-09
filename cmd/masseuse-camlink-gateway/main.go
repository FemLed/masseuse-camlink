// masseuse-camlink-gateway runs inside the video enclave and terminates the
// connector's tunnel (docs/PROTOCOL.md, sections 4 and 5).
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
	fmt.Fprintln(os.Stderr, "masseuse-camlink-gateway: not implemented yet")
	os.Exit(2)
}
