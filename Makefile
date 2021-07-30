all: test/readme/readme.t.js EDIFIED.md

test/readme/readme.t.js: edify.md
	edify --mode code $< > $@
EDIFIED.md: edify.md
	edify --mode text $< > $@
