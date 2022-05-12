# FROM nginx:latest

# # Sets configuration files
# COPY default.conf /etc/nginx/conf.d/default.conf

# # deletes the default nginx page
# RUN rm -rf /usr/share/nginx/html/*



# #exposes port 80
# EXPOSE 80

# ENTRYPOINT [ "nginx","-g","daemon off;" ]

##################################################

FROM haproxy:latest

USER root
RUN mkdir /run/haproxy

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg



EXPOSE 8090
EXPOSE 80
EXPOSE 3999
EXPOSE 2999

CMD ["/usr/local/sbin/haproxy","-W","-db","-f","/usr/local/etc/haproxy/haproxy.cfg"]