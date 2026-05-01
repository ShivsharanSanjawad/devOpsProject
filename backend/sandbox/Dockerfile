# Use Ubuntu as the base image
FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install compilers and runtimes + isolation tools
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3 \
    nodejs \
    openjdk-17-jdk-headless \
    bc \
    time \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy the isolation script
COPY run_isolated.sh /usr/local/bin/run_isolated.sh
RUN chmod +x /usr/local/bin/run_isolated.sh

# Set working directory
WORKDIR /home

# Command to keep the container alive
CMD ["sleep", "infinity"]
