FROM python:3.9-slim

WORKDIR /app

RUN pip install --no-cache-dir flask pymongo requests schedule

RUN apt-get update && apt-get install -y curl

COPY client.py .
CMD ["python", "client.py"]
