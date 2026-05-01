#!/bin/bash
# entrypoint.sh

# Create isolate's cgroup subtree if cgroup v2 is available
if [ -w /sys/fs/cgroup ]; then
    echo "Setting up cgroup v2 for isolate..."
    
    # Enable controllers at root level
    echo "+memory +cpu +pids" > /sys/fs/cgroup/cgroup.subtree_control 2>/dev/null || true

    # Create isolate's cgroup
    mkdir -p /sys/fs/cgroup/isolate 2>/dev/null || true
    
    # Delegate controllers to isolate's subtree
    echo "+memory +cpu +pids" > /sys/fs/cgroup/isolate/cgroup.subtree_control 2>/dev/null || true
    
    echo "cgroup setup done"
else
    echo "WARNING: /sys/fs/cgroup not writable — cgroup limits won't work"
fi

exec sleep infinity
