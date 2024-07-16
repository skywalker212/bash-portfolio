#!/bin/bash

# Install required dependencies
apt-get update
apt-get install -y python3 cmake

# Download and install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Add Emscripten to PATH
echo 'export PATH="/vercel/path0/emsdk:/vercel/path0/emsdk/upstream/emscripten:$PATH"' >> $BASH_ENV