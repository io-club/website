#!/bin/sh
set -ex
cd ./RedisJSON
cargo build --release
cd -

cd ./RediSearch
cmake . -Bbuild
cmake --build build -j4
cd -
