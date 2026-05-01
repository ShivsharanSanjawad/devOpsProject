#!/bin/bash
set -e

echo "=== Setting up cgroup controllers ==="
if [ -w /sys/fs/cgroup/cgroup.subtree_control ]; then
    echo "+memory +cpu +pids" > /sys/fs/cgroup/cgroup.subtree_control
    echo "Controllers enabled: $(cat /sys/fs/cgroup/cgroup.subtree_control)"
else
    echo "WARNING: Cannot write cgroup.subtree_control — cgroup limits may not work"
fi

echo "=== Isolate ready ==="
exec sleep infinity
