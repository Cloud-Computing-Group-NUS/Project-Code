FROM python:3.10.12
WORKDIR /app
RUN pip install --no-cache-dir flask flask_cors requests kubernetes
COPY . .
CMD ["python", "app.py"]