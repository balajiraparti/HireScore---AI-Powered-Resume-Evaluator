FROM mcr.microsoft.com/devcontainers/python:3.12

ENV PYTHONUNBUFFERED=1

RUN sudo apt-get update && \
            sudo apt-get install -y curl

RUN sudo apt-get install -y poppler-utils

RUN pip install --upgrade pip   

# ✅ Install Node.js properly
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# ✅ Install pnpm
RUN npm install -g pnpm
