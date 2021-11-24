#!/bin/bash

cd ..
npm ci
cd example
npm ci
npm run dev:generate posts 20
npm run dev:generate projects 10
npm run build:client
npm run build:site