#!/bin/bash

# copy files
cp package.json package.json.copy
cp package-lock.json package-lock.json.copy

# npm
npm install

# rewrite files
mv package.json.copy package.json
mv package-lock.json.copy package-lock.json

# packaging
npx vsce package
