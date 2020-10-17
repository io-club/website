#!/bin/sh
find . -name "*.dot" | while read i; do
	dot -Tsvg ${i} -o${i%.dot}.svg
done
