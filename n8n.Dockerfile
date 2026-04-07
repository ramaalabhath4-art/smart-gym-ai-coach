# n8n on Railway — Smart Gym AI Coach
# Uses the official n8n Docker image with persistent volume support
FROM n8nio/n8n:latest

# n8n listens on 5678 by default; Railway maps $PORT automatically
ENV N8N_PORT=${PORT:-5678}
ENV N8N_HOST=0.0.0.0
ENV N8N_PROTOCOL=https
ENV WEBHOOK_URL=${N8N_WEBHOOK_TUNNEL_URL}
ENV GENERIC_TIMEZONE=UTC
ENV N8N_DIAGNOSTICS_ENABLED=false

EXPOSE 5678
