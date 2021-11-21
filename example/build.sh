#!/bin/bash

cd ..
npm i
cd example
npm i
npm run dev:generate posts 20
npm run dev:generate projects 10
npm run build:client
npm run build:site