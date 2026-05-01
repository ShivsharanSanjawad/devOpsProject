# Use Ubuntu as the base image
FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install compilers and runtimes + isolation tools
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    make \
    pkg-config \
    python3 \
    nodejs \
    openjdk-17-jdk-headless \
    bc \
    time \
    procps \
    libcap-dev \
    libseccomp-dev \
    libsystemd-dev \
    asciidoc \
    && rm -rf /var/lib/apt/lists/*

# Install isolate from source
RUN git clone --depth 1 https://github.com/ioi/isolate /tmp/isolate \
    && make -C /tmp/isolate \
    && make -C /tmp/isolate install \
    && rm -rf /tmp/isolate

RUN mkdir -p /var/local/lib/isolate /var/local/lib/isolate/lock /usr/local/etc \
    && chmod 700 /var/local/lib/isolate /var/local/lib/isolate/lock \
    && printf "box_root=/var/local/lib/isolate\nlock_root=/var/local/lib/isolate/lock\nfirst_uid=10000\nfirst_gid=10000\nnum_boxes=1000\ncg_root=/sys/fs/cgroup/isolate\n" > /usr/local/etc/isolate

# Copy the isolation script
COPY run_isolated.sh /usr/local/bin/run_isolated.sh
RUN sed -i 's/\r$//' /usr/local/bin/run_isolated.sh && chmod +x /usr/local/bin/run_isolated.sh

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

# Set working directory
WORKDIR /home

CMD ["/entrypoint.sh"]
