FROM node:20-alpine AS base
WORKDIR /app

# Copy the workspace manifest
COPY package.json ./

# Copy individual package manifests
COPY resume-core/package.json ./resume-core/
COPY resume-templates/package.json ./resume-templates/

# Install dependencies for all workspaces
RUN yarn install

# Copy source code
COPY . .

# Build all packages
RUN yarn build

# Final stage for artifacts
FROM alpine AS artifacts
WORKDIR /app

# Ensure we have a place to put them
RUN mkdir -p /packages

COPY --from=base /app/resume-core/dist /packages/resume-core/dist
COPY --from=base /app/resume-core/package.json /packages/resume-core/package.json
COPY --from=base /app/resume-templates/dist /packages/resume-templates/dist
COPY --from=base /app/resume-templates/package.json /packages/resume-templates/package.json

# Keep the container alive so the healthcheck can pass
# And provide a way to verify the files
CMD ["sh", "-c", "echo 'Built artifacts ready in /packages' && sleep infinity"]
