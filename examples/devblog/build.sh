#!/bin/bash

cd ../..
pnpm install
pnpm build
cd examples/devblog
pnpm install
pnpm dev:generate posts 20
pnpm dev:generate projects 10
pnpm build:client
pnpm build:site