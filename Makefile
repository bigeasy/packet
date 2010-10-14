test:
	NODE_PATH=./lib vows vows/*.js --spec

coverage:
	expresso coverage.js --coverage

.PHONEY: test coverage
