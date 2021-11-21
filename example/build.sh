#!/bin/bash

cd ..
npm i
cd example
npm i
npm run dev:generate
npm run build:client
npm run build:site