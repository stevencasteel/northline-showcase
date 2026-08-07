#!/usr/bin/env zsh

set -e

SCRIPT_DIR="${0:A:h}"
cd "${SCRIPT_DIR}/.."

printf '\e]0;Northline Roofing Source Context\a'
node scripts/create-source-context.js
open -R "${SCRIPT_DIR}/../docs/northline-roofing_source_code.txt"
