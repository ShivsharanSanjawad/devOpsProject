#!/bin/bash
# /usr/local/bin/run_isolated.sh
# Args: $1=username $2=language $3=time_limit_ms $4=memory_limit_mb $5=run_command

USERNAME=$1
LANG=$2
TIME_LIMIT_MS=$3
MEM_LIMIT_MB=$4
RUN_COMMAND=$5

HOMEDIR="/home/$USERNAME"
CGROUP="judge_${USERNAME}"
TIME_LIMIT_S=$(echo "scale=3; $TIME_LIMIT_MS/1000" | bc)
MEM_BYTES=$(( MEM_LIMIT_MB * 1024 * 1024 ))
TIME_FILE="/tmp/time_${USERNAME}.txt"

# --- Setup cgroup v2 ---
CGROUP_READY=false
if [ -w /sys/fs/cgroup ]; then
    mkdir -p /sys/fs/cgroup/$CGROUP 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "$MEM_BYTES"    > /sys/fs/cgroup/$CGROUP/memory.max 2>/dev/null
        echo "0"             > /sys/fs/cgroup/$CGROUP/memory.swap.max 2>/dev/null
        echo "100000 100000" > /sys/fs/cgroup/$CGROUP/cpu.max 2>/dev/null
        CGROUP_READY=true
    fi
fi

# --- Create isolated user ---
useradd -M -d $HOMEDIR -s /bin/bash $USERNAME 2>/dev/null || true
mkdir -p $HOMEDIR
touch $HOMEDIR/output.txt $HOMEDIR/error.txt
chown -R $USERNAME:$USERNAME $HOMEDIR 2>/dev/null || true
chmod 755 $HOMEDIR

# --- Run with restrictions ---
START=$(date +%s%N)

(
    if [ "$CGROUP_READY" = "true" ]; then
        echo "$BASHPID" > /sys/fs/cgroup/$CGROUP/cgroup.procs 2>/dev/null
    fi
    chown -R $USERNAME:$USERNAME $HOMEDIR 2>/dev/null || true
    
    runuser -u $USERNAME -- bash -c "
        export HOME=$HOMEDIR
        cd $HOMEDIR
        ulimit -u 256
        ulimit -f 10240
        ulimit -n 64
        ulimit -s 65536
        
        /usr/bin/time -v -o $TIME_FILE timeout --kill-after=1s ${TIME_LIMIT_S}s \
            $RUN_COMMAND \
            < $HOMEDIR/input.txt \
            > $HOMEDIR/output.txt \
            2> $HOMEDIR/error.txt
    "
)
EXIT_CODE=$?

END=$(date +%s%N)
TIME_TAKEN_MS=$(( (END - START) / 1000000 ))

# --- Read statistics ---
PEAK_MEM_KB=0

# Try cgroup first
if [ "$CGROUP_READY" = "true" ]; then
    PEAK_MEM_BYTES=$(cat /sys/fs/cgroup/$CGROUP/memory.peak 2>/dev/null || echo 0)
    PEAK_MEM_KB=$(( PEAK_MEM_BYTES / 1024 ))
    
    # --- Cleanup cgroup ---
    echo 1 > /sys/fs/cgroup/$CGROUP/cgroup.kill 2>/dev/null || true
    sleep 0.1
    rmdir /sys/fs/cgroup/$CGROUP 2>/dev/null || true
fi

# Fallback to /usr/bin/time output if cgroup memory is 0
if [ "$PEAK_MEM_KB" -eq 0 ] && [ -f "$TIME_FILE" ]; then
    # Extract Maximum resident set size (kbytes) from time output
    MAXRSS=$(grep "Maximum resident set size" "$TIME_FILE" 2>/dev/null | awk '{print $NF}')
    if [ -n "$MAXRSS" ]; then
        PEAK_MEM_KB=$MAXRSS
    fi
fi
rm -f "$TIME_FILE" 2>/dev/null

userdel -f $USERNAME 2>/dev/null || true

# Output for parser
echo "EXIT=$EXIT_CODE"
echo "TIME_MS=$TIME_TAKEN_MS"
echo "MEM_KB=$PEAK_MEM_KB"
