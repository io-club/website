FROM alpine:latest

COPY ./cargo-config /cargo-config

RUN mkdir -p ~/.cargo && mv /cargo-config ~/.cargo/config \
\
	&& sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories \
	&& apk add --no-cache \
	redis \
	openssh \
	sudo \
	libgcc \
\
	clang-libs \
	git \
	bash \
	python3 \
	py3-setuptools \
	py3-pip \
	unzip \
	wget \
	alpine-sdk \
	cmake \
	cargo \
\
	&& mkdir -p /opt/build /opt/redis-modules \
\
	&& cd /opt/build \
	&& git clone https://github.com/RedisJSON/RedisJSON \
	&& cd RedisJSON \
	&& git submodule update --init --recursive \
	&& cd .. \
	&& git clone https://github.com/RediSearch/RediSearch \
\
	&& cd /opt/build/RedisJSON \
	&& make build shell=/bin/bash \
	&& cp target/release/librejson.so /opt/redis-modules \
\
	&& cd /opt/build/RediSearch \
	&& cmake . -DCMAKE_INSTALL_PREFIX="/opt/redis-modules" -Bbuild \
	&& cmake --build build \
	&& cp build/redisearch.so /opt/redis-modules \
\
	&& rm -rf /opt/build \
	&& rm -rf ~/.cargo \
	&& strip /opt/redis-modules/*.so \
	&& apk del --purge alpine-sdk cmake cargo python3 py3-setuptools py3-pip unzip wget bash git clang-libs \
	&& adduser -D -s /bin/ash admin

USER admin
VOLUME ["/home/admin"]
WORKDIR /home/admin
EXPOSE 6379
CMD ["redis-server", "--loadmodule", "/opt/redis-modules/librejson.so", "--loadmodule", "/opt/redis-modules/redisearch.so"]
