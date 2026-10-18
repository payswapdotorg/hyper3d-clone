#!/bin/bash
# Durability push to engine2-recovery (token from git config, not hardcoded)
cd /home/z/my-project || exit 1
TOKEN=$(git config branch.main.remote | sed -E 's#https://x-access-token:([^@]+)@.*#\1#')
git add -A
git diff --cached --quiet && { echo "nothing to commit"; exit 0; }
git commit -q -m "worker <worker@hyper3d-clone> ${1:-checkpoint}" 
git push -q "https://x-access-token:${TOKEN}@github.com/payswapdotorg/hyper3d-clone.git" HEAD:engine2-recovery && echo "PUSHED $(git rev-parse --short HEAD)"
