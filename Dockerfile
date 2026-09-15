FROM nginx:alpine

# Railway routes the custom domain to port 8080.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
EXPOSE 8080
