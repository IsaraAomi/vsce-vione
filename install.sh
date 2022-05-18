#!/bin/bash
VERSION=$1
if [ -z ${VERSION} ]; then
    echo "[ERROR] Specify the version number as the first argument."
    exit 1
fi
code --install-extension vsce-vione-${VERSION}.vsix
