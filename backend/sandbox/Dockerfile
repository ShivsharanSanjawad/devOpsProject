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
    asciidoc \
    && rm -rf /var/lib/apt/lists/*

# Install isolate from source
RUN git clone --depth 1 https://github.com/ioi/isolate /tmp/isolate \
    && make -C /tmp/isolate \
    && make -C /tmp/isolate install \
    && rm -rf /tmp/isolate

# Copy the isolation script
COPY run_isolated.sh /usr/local/bin/run_isolated.sh
RUN sed -i 's/\r$//' /usr/local/bin/run_isolated.sh && chmod +x /usr/local/bin/run_isolated.sh

# Set working directory
WORKDIR /home

# Command to keep the container alive
CMD ["sleep", "infinity"]
