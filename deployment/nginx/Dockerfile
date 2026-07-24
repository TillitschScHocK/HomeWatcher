# Reverse-proxy nginx
# Removes the default nginx:alpine server block so our nginx.conf
# is the only config loaded and there is no duplicate listen 80 conflict.
FROM nginx:alpine

# Remove the default server block that nginx:alpine ships with.
# The entrypoint scripts also touch this file, so we replace it
# with an empty stub so they have nothing to conflict with.
RUN rm -f /etc/nginx/conf.d/default.conf && \
    mkdir -p /etc/nginx/conf.d && \
    touch /etc/nginx/conf.d/default.conf

# Our full nginx.conf is mounted at runtime via docker-compose volume.
# No COPY needed here - it comes in as a bind mount.
