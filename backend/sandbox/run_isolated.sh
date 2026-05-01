#!/bin/bash
# /usr/local/bin/run_isolated.sh
# Args: $1=username $2=language $3=time_limit_ms $4=memory_limit_mb $5=run_command

USERNAME=$1
LANG=$2
TIME_LIMIT_MS=$3
MEM_LIMIT_MB=$4
RUN_COMMAND=$5

HOMEDIR="/home/$USERNAME"
INPUT_PATH="/tmp/judge_inputs/${USERNAME}.txt"
LOCK_ROOT="/tmp/isolate-locks"
TIME_LIMIT_S=$(echo "scale=3; $TIME_LIMIT_MS/1000" | bc)
MEM_LIMIT_KB=$(( MEM_LIMIT_MB * 1024 ))

if ! command -v isolate >/dev/null 2>&1; then
    echo "EXIT=1"
    echo "TIME_MS=0"
    echo "MEM_KB=0"
    echo "STATUS=ISOLATE_MISSING"
    exit 1
fi

mkdir -p "$HOMEDIR" "$LOCK_ROOT" "/tmp/judge_inputs"
touch "$HOMEDIR/output.txt" "$HOMEDIR/error.txt"
chmod 755 "$HOMEDIR"

BOX_ID=""
LOCK_PATH=""
for i in $(seq 1 40); do
    CANDIDATE=$(( RANDOM % 999 ))
    CANDIDATE_LOCK="$LOCK_ROOT/$CANDIDATE"
    if mkdir "$CANDIDATE_LOCK" 2>/dev/null; then
        BOX_ID=$CANDIDATE
        LOCK_PATH=$CANDIDATE_LOCK
        break
    fi
done

if [ -z "$BOX_ID" ]; then
    echo "EXIT=1"
    echo "TIME_MS=0"
    echo "MEM_KB=0"
    echo "STATUS=NO_BOX_AVAILABLE"
    exit 1
fi

cleanup() {
    if [ -n "$BOX_ID" ]; then
        if [ -n "$CGROUP_FLAG" ]; then
            isolate --box-id="$BOX_ID" $CGROUP_FLAG --cleanup >/dev/null 2>&1 || true
        else
            isolate --box-id="$BOX_ID" --cleanup >/dev/null 2>&1 || true
        fi
    fi
    rm -rf "$LOCK_PATH" >/dev/null 2>&1 || true
}

trap cleanup EXIT

META_FILE="/tmp/isolate_meta_${BOX_ID}.txt"
CGROUP_FLAG="--cg"

BOXDIR=$(isolate --box-id="$BOX_ID" $CGROUP_FLAG --init 2>/dev/null)
if [ -z "$BOXDIR" ]; then
    CGROUP_FLAG=""
    BOXDIR=$(isolate --box-id="$BOX_ID" --init 2>/dev/null)
fi

if [ -z "$BOXDIR" ]; then
    echo "EXIT=1"
    echo "TIME_MS=0"
    echo "MEM_KB=0"
    echo "STATUS=INIT_FAILED"
    exit 1
fi

BOX_PATH="$BOXDIR/box"
mkdir -p "$BOX_PATH"

cp -f "$HOMEDIR"/solution* "$BOX_PATH"/ 2>/dev/null || true
cp -f "$HOMEDIR"/Solution* "$BOX_PATH"/ 2>/dev/null || true

if [ -f "$INPUT_PATH" ]; then
    chmod 600 "$INPUT_PATH" 2>/dev/null || true
    cp -f "$INPUT_PATH" "$BOX_PATH/.input" 2>/dev/null || true
else
    touch "$BOX_PATH/.input"
fi

chmod 600 "$BOX_PATH/.input" 2>/dev/null || true
touch "$BOX_PATH/output.txt" "$BOX_PATH/error.txt"

RUN_COMMAND_BOX=${RUN_COMMAND//\/home\/${USERNAME}\//\/box\/}

START=$(date +%s%N)
if [ -n "$CGROUP_FLAG" ]; then
    isolate \
        --box-id="$BOX_ID" \
        $CGROUP_FLAG \
        --cg-mem="$MEM_LIMIT_KB" \
        --time="$TIME_LIMIT_S" \
        --wall-time=$(echo "$TIME_LIMIT_S * 3" | bc) \
        --extra-time=0.5 \
        --stack=65536 \
        --open-files=64 \
        --fsize=10240 \
        --processes=64 \
        --meta="$META_FILE" \
        --silent \
        -E PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/jvm/java-17-openjdk-amd64/bin \
        -E HOME=/box \
        --stdin=.input \
        --stdout=output.txt \
        --stderr=error.txt \
        --run -- /bin/bash -lc "$RUN_COMMAND_BOX"
else
    isolate \
        --box-id="$BOX_ID" \
        --time="$TIME_LIMIT_S" \
        --wall-time=$(echo "$TIME_LIMIT_S * 3" | bc) \
        --extra-time=0.5 \
        --stack=65536 \
        --open-files=64 \
        --fsize=10240 \
        --processes=64 \
        --meta="$META_FILE" \
        --silent \
        -E PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/jvm/java-17-openjdk-amd64/bin \
        -E HOME=/box \
        --stdin=.input \
        --stdout=output.txt \
        --stderr=error.txt \
        --run -- /bin/bash -lc "$RUN_COMMAND_BOX"
fi
RUN_EXIT=$?

END=$(date +%s%N)
TIME_TAKEN_MS=$(( (END - START) / 1000000 ))

cp -f "$BOX_PATH/output.txt" "$HOMEDIR/output.txt" 2>/dev/null || true
cp -f "$BOX_PATH/error.txt" "$HOMEDIR/error.txt" 2>/dev/null || true
rm -f "$INPUT_PATH" 2>/dev/null || true

TIME_MS=$(awk -F: '/^time:/{gsub(/ /, "", $2); printf "%.0f", $2*1000}' "$META_FILE" 2>/dev/null)
MEM_KB=$(awk -F: '/^cg-mem:/{gsub(/ /, "", $2); print $2}' "$META_FILE" 2>/dev/null)
EXIT_CODE=$(awk -F: '/^exitcode:/{gsub(/ /, "", $2); print $2}' "$META_FILE" 2>/dev/null)
STATUS=$(awk -F: '/^status:/{gsub(/ /, "", $2); print $2}' "$META_FILE" 2>/dev/null)

if [ -z "$TIME_MS" ]; then
    TIME_MS=$TIME_TAKEN_MS
fi
if [ -z "$MEM_KB" ]; then
    MEM_KB=0
fi
if [ -z "$EXIT_CODE" ]; then
    EXIT_CODE=$RUN_EXIT
fi

echo "EXIT=$EXIT_CODE"
echo "TIME_MS=$TIME_MS"
echo "MEM_KB=$MEM_KB"
if [ -n "$STATUS" ]; then
    echo "STATUS=$STATUS"
fi
