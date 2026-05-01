#!/bin/bash
set -e

# Step 1: enable controllers at root
echo "+memory +cpu +pids" > /sys/fs/cgroup/cgroup.subtree_control 2>/dev/null || true

# Step 2: create isolate subtree and delegate controllers
mkdir -p /sys/fs/cgroup/isolate 2>/dev/null || true
echo "+memory +cpu +pids" > /sys/fs/cgroup/isolate/cgroup.subtree_control 2>/dev/null || true

echo "Controllers at root: $(cat /sys/fs/cgroup/cgroup.subtree_control 2>/dev/null)"
echo "Controllers at isolate: $(cat /sys/fs/cgroup/isolate/cgroup.subtree_control 2>/dev/null)"

exec sleep infinity
