FROM golang:1.21-alpine AS builder
RUN apk add --no-cache git
RUN git clone https://github.com/Threadfin/Threadfin.git /src
WORKDIR /src
RUN go build -o threadfin .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
RUN adduser -D -h /home/threadfin threadfin
WORKDIR /home/threadfin
COPY --from=builder /src/threadfin ./threadfin
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh threadfin
USER threadfin
EXPOSE 34400
ENTRYPOINT ["./entrypoint.sh"]
